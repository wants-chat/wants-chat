/**
 * Order and Inventory Component Generators
 * For order lists, queues, timelines, and inventory management
 */

export interface OrderInventoryOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Order List Recent Brewery Component
 */
export function generateOrderListRecentBrewery(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface OrderListRecentBreweryProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        items: Array<{ name: string; quantity: number }>;
        total: number;
        status: 'pending' | 'preparing' | 'ready' | 'completed';
        time: string;
      }>;
      onSelect?: (id: string) => void;
      onStatusChange?: (id: string, status: string) => void;
    }

    const OrderListRecentBrewery: React.FC<OrderListRecentBreweryProps> = ({ orders, onSelect, onStatusChange }) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Recent Orders</h3>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(order.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🍺</span>
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[order.status]}\`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">{order.items.map(i => \`\${i.quantity}x \${i.name}\`).join(', ')}</p>
                  <div className="flex items-center gap-3">
                    <p className="font-medium">\${order.total}</p>
                    <p className="text-gray-400">{order.time}</p>
                  </div>
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
 * Generate Order List Recent Nursery Component
 */
export function generateOrderListRecentNursery(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface OrderListRecentNurseryProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        plants: Array<{ name: string; quantity: number; size: string }>;
        total: number;
        status: 'pending' | 'preparing' | 'ready' | 'delivered';
        pickupDate?: string;
        deliveryAddress?: string;
      }>;
      onSelect?: (id: string) => void;
    }

    const OrderListRecentNursery: React.FC<OrderListRecentNurseryProps> = ({ orders, onSelect }) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        delivered: 'bg-gray-100 text-gray-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Recent Plant Orders</h3>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(order.id)}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>🌱</span>
                      <p className="font-medium">#{order.orderNumber}</p>
                    </div>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[order.status]}\`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {order.plants.slice(0, 2).map(p => \`\${p.quantity}x \${p.name} (\${p.size})\`).join(', ')}
                  {order.plants.length > 2 && \` +\${order.plants.length - 2} more\`}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">
                    {order.deliveryAddress ? '📦 Delivery' : '🏪 Pickup'} {order.pickupDate}
                  </p>
                  <p className="font-medium">\${order.total}</p>
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
 * Generate Order Queue Foodtruck Component
 */
export function generateOrderQueueFoodtruck(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface OrderQueueFoodtruckProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        items: Array<{ name: string; quantity: number; mods?: string[] }>;
        total: number;
        status: 'new' | 'preparing' | 'ready';
        waitTime: number;
        priority?: boolean;
      }>;
      onStatusChange?: (id: string, status: string) => void;
      onComplete?: (id: string) => void;
    }

    const OrderQueueFoodtruck: React.FC<OrderQueueFoodtruckProps> = ({ orders, onStatusChange, onComplete }) => {
      const statusColors = {
        new: 'bg-red-100 text-red-800',
        preparing: 'bg-yellow-100 text-yellow-800',
        ready: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Order Queue</h3>
            <span className="text-sm text-gray-500">{orders.filter(o => o.status !== 'ready').length} active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {['new', 'preparing', 'ready'].map((status) => (
              <div key={status} className="space-y-3">
                <h4 className="font-medium capitalize text-sm text-gray-500">{status}</h4>
                {orders.filter(o => o.status === status).map((order) => (
                  <div
                    key={order.id}
                    className={\`p-3 rounded-lg border \${order.priority ? 'border-red-300 bg-red-50' : 'bg-gray-50'}\`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.waitTime}m</p>
                    </div>
                    <p className="text-sm mb-2">{order.customer}</p>
                    <div className="text-xs space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <p key={i}>
                          {item.quantity}x {item.name}
                          {item.mods?.length ? <span className="text-gray-500"> ({item.mods.join(', ')})</span> : null}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {status === 'new' && (
                        <button
                          onClick={() => onStatusChange?.(order.id, 'preparing')}
                          className="flex-1 px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Start
                        </button>
                      )}
                      {status === 'preparing' && (
                        <button
                          onClick={() => onStatusChange?.(order.id, 'ready')}
                          className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Ready
                        </button>
                      )}
                      {status === 'ready' && (
                        <button
                          onClick={() => onComplete?.(order.id)}
                          className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Order Timeline Laundry Component
 */
export function generateOrderTimelineLaundry(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface OrderTimelineLaundryProps {
      order: {
        id: string;
        orderNumber: string;
        status: 'received' | 'washing' | 'drying' | 'folding' | 'ready' | 'delivered';
        items: Array<{ type: string; quantity: number }>;
        timeline: Array<{
          status: string;
          timestamp: string;
          note?: string;
        }>;
        estimatedReady: string;
      };
    }

    const OrderTimelineLaundry: React.FC<OrderTimelineLaundryProps> = ({ order }) => {
      const steps = ['received', 'washing', 'drying', 'folding', 'ready', 'delivered'];
      const currentIndex = steps.indexOf(order.status);

      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
              <p className="text-sm text-gray-500">Est. ready: {order.estimatedReady}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {order.status}
            </span>
          </div>

          <div className="relative mb-6">
            <div className="absolute top-4 left-4 right-4 h-1 bg-gray-200 rounded" />
            <div
              className="absolute top-4 left-4 h-1 rounded transition-all"
              style={{
                width: \`\${(currentIndex / (steps.length - 1)) * 100}%\`,
                backgroundColor: '${primaryColor}'
              }}
            />
            <div className="relative flex justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm \${
                      i <= currentIndex ? 'text-white' : 'bg-gray-200 text-gray-500'
                    }\`}
                    style={{ backgroundColor: i <= currentIndex ? '${primaryColor}' : undefined }}
                  >
                    {i < currentIndex ? '✓' : i + 1}
                  </div>
                  <p className="text-xs mt-2 capitalize">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Activity</h4>
            {order.timeline.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '${primaryColor}' }} />
                <div>
                  <p className="text-sm capitalize">{event.status}</p>
                  <p className="text-xs text-gray-500">{event.timestamp}</p>
                  {event.note && <p className="text-xs text-gray-400">{event.note}</p>}
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
 * Generate Pending Orders Florist Component
 */
export function generatePendingOrdersFlorist(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PendingOrdersFloristProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        items: Array<{ name: string; quantity: number }>;
        total: number;
        deliveryDate: string;
        deliveryTime: string;
        recipient: string;
        address: string;
        message?: string;
        priority: boolean;
      }>;
      onSelect?: (id: string) => void;
      onStartPrep?: (id: string) => void;
    }

    const PendingOrdersFlorist: React.FC<PendingOrdersFloristProps> = ({ orders, onSelect, onStartPrep }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Pending Orders</h3>
            <span className="text-sm text-gray-500">{orders.length} orders</span>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div
                key={order.id}
                className={\`p-4 hover:bg-gray-50 \${order.priority ? 'border-l-4 border-red-500' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(order.id)}>
                    <div className="flex items-center gap-2">
                      <span>💐</span>
                      <p className="font-medium">#{order.orderNumber}</p>
                      {order.priority && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Rush</span>}
                    </div>
                    <p className="text-sm text-gray-500">For: {order.recipient}</p>
                  </div>
                  <button
                    onClick={() => onStartPrep?.(order.id)}
                    className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                    style={{ backgroundColor: '${primaryColor}' }}
                  >
                    Start Prep
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {order.items.map(i => \`\${i.quantity}x \${i.name}\`).join(', ')}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500">📅 {order.deliveryDate} at {order.deliveryTime}</p>
                  <p className="font-medium">\${order.total}</p>
                </div>
                {order.message && (
                  <p className="mt-2 text-xs text-gray-400 italic">"{order.message}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Low Stock Alerts Component
 */
export function generateLowStockAlerts(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LowStockAlertsProps {
      items: Array<{
        id: string;
        name: string;
        sku: string;
        currentStock: number;
        minimumStock: number;
        unit: string;
        lastOrdered?: string;
        suggestedOrder: number;
      }>;
      onReorder?: (id: string, quantity: number) => void;
      onDismiss?: (id: string) => void;
    }

    const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ items, onReorder, onDismiss }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b bg-yellow-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-semibold">Low Stock Alerts</h3>
              <span className="ml-auto text-sm text-gray-500">{items.length} items</span>
            </div>
          </div>
          <div className="divide-y">
            {items.map((item) => {
              const stockPercent = (item.currentStock / item.minimumStock) * 100;
              return (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onReorder?.(item.id, item.suggestedOrder)}
                        className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        Reorder {item.suggestedOrder}
                      </button>
                      <button
                        onClick={() => onDismiss?.(item.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{item.currentStock} {item.unit}</span>
                        <span className="text-gray-500">min: {item.minimumStock}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={\`h-full rounded-full \${stockPercent < 50 ? 'bg-red-500' : 'bg-yellow-500'}\`}
                          style={{ width: \`\${Math.min(stockPercent, 100)}%\` }}
                        />
                      </div>
                    </div>
                    {item.lastOrdered && (
                      <p className="text-xs text-gray-400">Last ordered: {item.lastOrdered}</p>
                    )}
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

/**
 * Generate Stock Adjustment Form Component
 */
export function generateStockAdjustmentForm(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface StockAdjustmentFormProps {
      item: {
        id: string;
        name: string;
        sku: string;
        currentStock: number;
        unit: string;
      };
      onSubmit?: (data: { reason: string; quantity: number; notes: string }) => void;
      onCancel?: () => void;
    }

    const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ item, onSubmit, onCancel }) => {
      const [formData, setFormData] = React.useState({
        reason: '',
        quantity: 0,
        notes: '',
      });

      const reasons = [
        { value: 'received', label: 'Stock Received' },
        { value: 'damaged', label: 'Damaged/Defective' },
        { value: 'expired', label: 'Expired' },
        { value: 'count', label: 'Inventory Count' },
        { value: 'return', label: 'Customer Return' },
        { value: 'other', label: 'Other' },
      ];

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
      };

      const newStock = item.currentStock + formData.quantity;

      return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-lg mb-4">Adjust Stock</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            <p className="text-sm">Current Stock: <span className="font-medium">{item.currentStock} {item.unit}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select reason...</option>
                {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity Adjustment</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter positive or negative number"
              />
              <p className="text-sm text-gray-500 mt-1">
                New stock will be: <span className={\`font-medium \${newStock < 0 ? 'text-red-500' : ''}\`}>{newStock} {item.unit}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Optional notes..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: '${primaryColor}' }}
            >
              Submit Adjustment
            </button>
          </div>
        </form>
      );
    };
  `;
}

/**
 * Generate Inventory Report Component
 */
export function generateInventoryReport(options: OrderInventoryOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface InventoryReportProps {
      summary: {
        totalItems: number;
        totalValue: number;
        lowStockItems: number;
        outOfStockItems: number;
      };
      categoryBreakdown: Array<{
        category: string;
        itemCount: number;
        value: number;
        percentage: number;
      }>;
      recentMovements: Array<{
        date: string;
        type: 'in' | 'out';
        item: string;
        quantity: number;
        reason: string;
      }>;
    }

    const InventoryReport: React.FC<InventoryReportProps> = ({ summary, categoryBreakdown, recentMovements }) => {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold" style={{ color: '${primaryColor}' }}>{summary.totalItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">\${summary.totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4">By Category</h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.category}</span>
                    <span>{cat.itemCount} items • \${cat.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: \`\${cat.percentage}%\`, backgroundColor: '${primaryColor}' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Movements</h3>
            </div>
            <div className="divide-y">
              {recentMovements.map((mov, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <span className={\`text-lg \${mov.type === 'in' ? 'text-green-500' : 'text-red-500'}\`}>
                    {mov.type === 'in' ? '↓' : '↑'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{mov.item}</p>
                    <p className="text-sm text-gray-500">{mov.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className={\`font-medium \${mov.type === 'in' ? 'text-green-600' : 'text-red-600'}\`}>
                      {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                    </p>
                    <p className="text-xs text-gray-400">{mov.date}</p>
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
