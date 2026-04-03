/**
 * Picking Component Generators
 *
 * Generates warehouse picking and fulfillment components.
 */

export interface PickingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePickList(options: PickingOptions = {}): string {
  const { componentName = 'PickList', endpoint = '/picking' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, MapPin, CheckCircle, Circle, Barcode, AlertTriangle, Clock, ArrowRight, Check, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PickItem {
  id: string;
  sku: string;
  name: string;
  quantity_required: number;
  quantity_picked: number;
  location: {
    zone: string;
    aisle: string;
    rack: string;
    shelf: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'issue';
  barcode?: string;
  image_url?: string;
  notes?: string;
}

interface PickOrder {
  id: string;
  order_number: string;
  customer_name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'partial';
  items: PickItem[];
  assigned_to?: string;
  started_at?: string;
  due_by?: string;
  wave?: string;
}

interface ${componentName}Props {
  orderId?: string;
  showScanner?: boolean;
  onComplete?: (orderId: string) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  orderId,
  showScanner = true,
  onComplete,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [scanInput, setScanInput] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const { data: pickOrder, isLoading } = useQuery({
    queryKey: ['pick-list', orderId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${orderId}\`);
      return response?.data || response;
    },
    enabled: !!orderId,
  });

  const updateItemStatus = useMutation({
    mutationFn: ({ itemId, status, quantity }: { itemId: string; status: string; quantity?: number }) =>
      api.put(\`${endpoint}/\${orderId}/items/\${itemId}\`, { status, quantity_picked: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-list', orderId] });
    },
  });

  const completePicking = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${orderId}/complete\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-list', orderId] });
      toast.success('Picking completed');
      onComplete?.(orderId!);
    },
  });

  const handleScan = (barcode: string) => {
    if (!pickOrder) return;

    const item = pickOrder.items.find((i: PickItem) => i.barcode === barcode || i.sku === barcode);
    if (item) {
      if (item.status === 'completed') {
        toast.info('Item already picked');
      } else {
        setSelectedItem(item.id);
        updateItemStatus.mutate({
          itemId: item.id,
          status: 'completed',
          quantity: item.quantity_required,
        });
        toast.success(\`Picked: \${item.name}\`);
      }
    } else {
      toast.error('Item not found in pick list');
    }
    setScanInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && scanInput) {
      handleScan(scanInput);
    }
  };

  const reportIssue = (itemId: string) => {
    updateItemStatus.mutate({ itemId, status: 'issue' });
    toast.warning('Issue reported for item');
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-300',
  };

  const itemStatusColors: Record<string, string> = {
    pending: 'text-gray-400',
    in_progress: 'text-blue-500',
    completed: 'text-green-500',
    issue: 'text-red-500',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!pickOrder) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No pick order found</p>
      </div>
    );
  }

  const completedItems = pickOrder.items.filter((i: PickItem) => i.status === 'completed').length;
  const totalItems = pickOrder.items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = completedItems === totalItems;

  // Sort items by location for efficient picking path
  const sortedItems = [...pickOrder.items].sort((a, b) => {
    const locA = \`\${a.location.zone}-\${a.location.aisle}-\${a.location.rack}-\${a.location.shelf}\`;
    const locB = \`\${b.location.zone}-\${b.location.aisle}-\${b.location.rack}-\${b.location.shelf}\`;
    return locA.localeCompare(locB);
  });

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pick List #{pickOrder.order_number}
              </h2>
              <span className={\`px-2 py-0.5 text-xs font-medium rounded border \${priorityColors[pickOrder.priority]}\`}>
                {pickOrder.priority}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{pickOrder.customer_name}</p>
            {pickOrder.wave && (
              <p className="text-xs text-gray-400 mt-1">Wave: {pickOrder.wave}</p>
            )}
          </div>

          {pickOrder.due_by && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Due By</p>
              <p className={\`text-sm font-medium \${new Date(pickOrder.due_by) < new Date() ? 'text-red-500' : 'text-gray-900 dark:text-white'}\`}>
                {new Date(pickOrder.due_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {completedItems} / {totalItems} items
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={\`h-3 rounded-full transition-all \${isComplete ? 'bg-green-500' : 'bg-blue-500'}\`}
              style={{ width: \`\${progress}%\` }}
            />
          </div>
        </div>

        {/* Scanner Input */}
        {showScanner && (
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scan barcode or enter SKU..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 text-lg"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {sortedItems.map((item: PickItem, index: number) => {
          const isSelected = selectedItem === item.id;
          const nextPendingIndex = sortedItems.findIndex((i) => i.status === 'pending');
          const isNext = index === nextPendingIndex;

          return (
            <div
              key={item.id}
              className={\`p-4 \${item.status === 'completed' ? 'bg-green-50 dark:bg-green-900/10' : ''} \${isNext ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-500 ring-inset' : ''} \${item.status === 'issue' ? 'bg-red-50 dark:bg-red-900/10' : ''}\`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="mt-1">
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : item.status === 'issue' ? (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  ) : (
                    <Circle className={\`w-6 h-6 \${isNext ? 'text-blue-500' : 'text-gray-300'}\`} />
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        x{item.quantity_required}
                      </p>
                      {item.status === 'completed' && item.quantity_picked !== item.quantity_required && (
                        <p className="text-sm text-orange-500">
                          Picked: {item.quantity_picked}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Zone {item.location.zone} <ArrowRight className="inline w-3 h-3" /> Aisle {item.location.aisle} <ArrowRight className="inline w-3 h-3" /> Rack {item.location.rack} <ArrowRight className="inline w-3 h-3" /> Shelf {item.location.shelf}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{item.notes}</p>
                  )}

                  {/* Actions */}
                  {item.status !== 'completed' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateItemStatus.mutate({ itemId: item.id, status: 'completed', quantity: item.quantity_required })}
                        disabled={updateItemStatus.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Mark Picked
                      </button>
                      <button
                        onClick={() => reportIssue(item.id)}
                        disabled={updateItemStatus.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Issue
                      </button>
                    </div>
                  )}

                  {item.status === 'issue' && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => updateItemStatus.mutate({ itemId: item.id, status: 'completed', quantity: item.quantity_required })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Resolved
                      </button>
                      <button
                        onClick={() => updateItemStatus.mutate({ itemId: item.id, status: 'pending' })}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Item Image */}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => completePicking.mutate()}
          disabled={!isComplete || completePicking.isPending}
          className={\`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors \${
            isComplete
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
          }\`}
        >
          {completePicking.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {isComplete ? 'Complete Picking' : \`\${totalItems - completedItems} items remaining\`}
        </button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePickQueue(options: PickingOptions = {}): string {
  const { componentName = 'PickQueue', endpoint = '/picking' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Clock, User, AlertTriangle, Play, ChevronRight, Filter, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  order_number: string;
  customer_name: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  items_count: number;
  items_picked: number;
  assigned_to?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  due_by?: string;
  wave?: string;
  zone?: string;
  estimated_time?: number; // minutes
}

interface ${componentName}Props {
  warehouseId?: string;
  zone?: string;
  onSelectOrder?: (orderId: string) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  warehouseId,
  zone,
  onSelectOrder,
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [waveFilter, setWaveFilter] = useState<string>('');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['pick-queue', warehouseId, zone, statusFilter, priorityFilter, waveFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouse_id', warehouseId);
      if (zone) params.append('zone', zone);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (waveFilter) params.append('wave', waveFilter);
      const response = await api.get<any>(\`${endpoint}/queue?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 15000,
  });

  const startPicking = useMutation({
    mutationFn: (orderId: string) => api.post(\`${endpoint}/\${orderId}/start\`, {}),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['pick-queue'] });
      toast.success('Picking started');
      onSelectOrder?.(orderId);
    },
  });

  const assignToSelf = useMutation({
    mutationFn: (orderId: string) => api.post(\`${endpoint}/\${orderId}/assign\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pick-queue'] });
      toast.success('Order assigned to you');
    },
  });

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-300',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const isOverdue = (dueBy?: string) => {
    if (!dueBy) return false;
    return new Date(dueBy) < new Date();
  };

  const waves = [...new Set(queue?.map((q: QueueItem) => q.wave).filter(Boolean) || [])];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const urgentCount = queue?.filter((q: QueueItem) => q.priority === 'urgent' && q.status === 'pending').length || 0;
  const overdueCount = queue?.filter((q: QueueItem) => isOverdue(q.due_by) && q.status !== 'completed').length || 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pick Queue</h2>
            <span className="text-sm text-gray-500">({queue?.length || 0} orders)</span>
          </div>

          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                <AlertTriangle className="w-3 h-3" />
                {urgentCount} urgent
              </span>
            )}
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs">
                <Clock className="w-3 h-3" />
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {waves.length > 0 && (
            <select
              value={waveFilter}
              onChange={(e) => setWaveFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Waves</option>
              {waves.map((wave: string) => (
                <option key={wave} value={wave}>{wave}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {queue && queue.length > 0 ? (
          queue.map((item: QueueItem) => {
            const overdue = isOverdue(item.due_by);
            const progress = item.items_count > 0 ? (item.items_picked / item.items_count) * 100 : 0;

            return (
              <div
                key={item.id}
                className={\`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${overdue && item.status !== 'completed' ? 'border-l-4 border-l-red-500' : ''}\`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        #{item.order_number}
                      </span>
                      <span className={\`px-2 py-0.5 text-xs font-medium rounded border \${priorityColors[item.priority]}\`}>
                        {item.priority}
                      </span>
                      <span className={\`px-2 py-0.5 text-xs font-medium rounded \${statusColors[item.status]}\`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {overdue && item.status !== 'completed' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">{item.customer_name}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {item.items_count} items
                      </span>
                      {item.wave && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {item.wave}
                        </span>
                      )}
                      {item.zone && (
                        <span>Zone: {item.zone}</span>
                      )}
                      {item.estimated_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{item.estimated_time} min
                        </span>
                      )}
                    </div>

                    {item.due_by && (
                      <p className={\`text-xs mt-1 \${overdue ? 'text-red-500' : 'text-gray-400'}\`}>
                        Due: {new Date(item.due_by).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    {item.status === 'in_progress' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{item.items_picked} / {item.items_count}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-blue-500"
                            style={{ width: \`\${progress}%\` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Assigned User */}
                    {item.assigned_to && (
                      <div className="flex items-center gap-2 mt-3">
                        {item.assigned_to.avatar_url ? (
                          <img
                            src={item.assigned_to.avatar_url}
                            alt={item.assigned_to.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className="text-xs text-gray-500">{item.assigned_to.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {item.status === 'pending' && !item.assigned_to && (
                      <button
                        onClick={() => assignToSelf.mutate(item.id)}
                        disabled={assignToSelf.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <User className="w-4 h-4" />
                        Claim
                      </button>
                    )}

                    {(item.status === 'pending' || item.status === 'in_progress') && (
                      <button
                        onClick={() => item.status === 'in_progress' ? onSelectOrder?.(item.id) : startPicking.mutate(item.id)}
                        disabled={startPicking.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {item.status === 'in_progress' ? (
                          <>
                            <ChevronRight className="w-4 h-4" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start
                          </>
                        )}
                      </button>
                    )}

                    {item.status === 'completed' && (
                      <button
                        onClick={() => onSelectOrder?.(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No orders in queue
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
