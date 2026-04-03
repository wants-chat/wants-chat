/**
 * Work Order Component Generators
 * For field service, maintenance, and job management
 */

export interface WorkOrderOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Work Order Filters Component
 */
export function generateWorkOrderFilters(options: WorkOrderOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface WorkOrderFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const WorkOrderFilters: React.FC<WorkOrderFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        priority: '',
        type: '',
        assignee: '',
        dateRange: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search work orders..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="installation">Installation</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Technicians</option>
                <option value="unassigned">Unassigned</option>
                <option value="tech-1">John Smith</option>
                <option value="tech-2">Sarah Johnson</option>
                <option value="tech-3">Mike Wilson</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Work Order Timeline Component
 */
export function generateWorkOrderTimeline(options: WorkOrderOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface WorkOrderTimelineProps {
      events: Array<{
        id: string;
        type: 'created' | 'assigned' | 'started' | 'paused' | 'completed' | 'note' | 'photo';
        description: string;
        user: string;
        timestamp: string;
        details?: string;
      }>;
    }

    const WorkOrderTimeline: React.FC<WorkOrderTimelineProps> = ({ events }) => {
      const getIcon = (type: string) => {
        switch (type) {
          case 'created': return '📝';
          case 'assigned': return '👤';
          case 'started': return '▶️';
          case 'paused': return '⏸️';
          case 'completed': return '✅';
          case 'note': return '📌';
          case 'photo': return '📷';
          default: return '•';
        }
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span>{getIcon(event.type)}</span>
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.user} • {event.timestamp}
                  </p>
                  {event.details && (
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                      {event.details}
                    </p>
                  )}
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
 * Generate Work Filters Component (simplified)
 */
export function generateWorkFilters(options: WorkOrderOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface WorkFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const WorkFilters: React.FC<WorkFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        status: '',
        category: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="operations">Operations</option>
                <option value="admin">Administrative</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Work Order Card Component
 */
export function generateWorkOrderCard(options: WorkOrderOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface WorkOrderCardProps {
      workOrder: {
        id: string;
        title: string;
        description: string;
        status: 'open' | 'in-progress' | 'on-hold' | 'completed';
        priority: 'critical' | 'high' | 'medium' | 'low';
        type: string;
        location: string;
        assignee?: { name: string; avatar?: string };
        dueDate: string;
        createdAt: string;
      };
      onSelect?: (id: string) => void;
    }

    const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder, onSelect }) => {
      const statusColors = {
        'open': 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        'on-hold': 'bg-gray-100 text-gray-800',
        'completed': 'bg-green-100 text-green-800',
      };

      const priorityColors = {
        'critical': 'border-l-4 border-l-red-500',
        'high': 'border-l-4 border-l-orange-500',
        'medium': 'border-l-4 border-l-yellow-500',
        'low': 'border-l-4 border-l-green-500',
      };

      return (
        <div
          className={\`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer \${priorityColors[workOrder.priority]}\`}
          onClick={() => onSelect?.(workOrder.id)}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">#{workOrder.id}</p>
              <h3 className="font-semibold">{workOrder.title}</h3>
            </div>
            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[workOrder.status]}\`}>
              {workOrder.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workOrder.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>📍 {workOrder.location}</span>
            <span>🏷️ {workOrder.type}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              {workOrder.assignee ? (
                <>
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {workOrder.assignee.avatar ? (
                      <img src={workOrder.assignee.avatar} alt="" className="w-full h-full rounded-full" />
                    ) : (
                      workOrder.assignee.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{workOrder.assignee.name}</span>
                </>
              ) : (
                <span className="text-sm text-gray-400">Unassigned</span>
              )}
            </div>
            <span className="text-sm text-gray-500">Due: {workOrder.dueDate}</span>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Work Order Detail Component
 */
export function generateWorkOrderDetail(options: WorkOrderOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface WorkOrderDetailProps {
      workOrder: {
        id: string;
        title: string;
        description: string;
        status: 'open' | 'in-progress' | 'on-hold' | 'completed';
        priority: 'critical' | 'high' | 'medium' | 'low';
        type: string;
        location: string;
        customer: { name: string; phone: string; email: string };
        assignee?: { name: string; phone: string };
        scheduledDate: string;
        dueDate: string;
        estimatedHours: number;
        actualHours?: number;
        parts: Array<{ name: string; quantity: number; cost: number }>;
        notes: string[];
        createdAt: string;
      };
      onStatusChange?: (status: string) => void;
      onAssign?: () => void;
    }

    const WorkOrderDetail: React.FC<WorkOrderDetailProps> = ({ workOrder, onStatusChange, onAssign }) => {
      const priorityColors = {
        'critical': 'bg-red-100 text-red-800',
        'high': 'bg-orange-100 text-orange-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'low': 'bg-green-100 text-green-800',
      };

      const totalPartsCost = workOrder.parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0);

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Work Order #{workOrder.id}</p>
                <h1 className="text-2xl font-bold">{workOrder.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={\`px-3 py-1 rounded-full text-sm font-medium \${priorityColors[workOrder.priority]}\`}>
                  {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)} Priority
                </span>
                <select
                  value={workOrder.status}
                  onChange={(e) => onStatusChange?.(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <p className="text-gray-600">{workOrder.description}</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {workOrder.customer.name}</p>
                <p><span className="text-gray-500">Phone:</span> {workOrder.customer.phone}</p>
                <p><span className="text-gray-500">Email:</span> {workOrder.customer.email}</p>
                <p><span className="text-gray-500">Location:</span> {workOrder.location}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Assignment</h3>
              {workOrder.assignee ? (
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Technician:</span> {workOrder.assignee.name}</p>
                  <p><span className="text-gray-500">Phone:</span> {workOrder.assignee.phone}</p>
                </div>
              ) : (
                <button
                  onClick={onAssign}
                  className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Assign Technician
                </button>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Schedule</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Scheduled:</span> {workOrder.scheduledDate}</p>
                <p><span className="text-gray-500">Due:</span> {workOrder.dueDate}</p>
                <p><span className="text-gray-500">Est. Hours:</span> {workOrder.estimatedHours}h</p>
                {workOrder.actualHours && (
                  <p><span className="text-gray-500">Actual Hours:</span> {workOrder.actualHours}h</p>
                )}
              </div>
            </div>
          </div>

          {workOrder.parts.length > 0 && (
            <div className="p-6 border-t">
              <h3 className="font-semibold mb-3">Parts & Materials</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2 text-right">Unit Cost</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrder.parts.map((part, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{part.name}</td>
                      <td className="py-2">{part.quantity}</td>
                      <td className="py-2 text-right">\${part.cost.toFixed(2)}</td>
                      <td className="py-2 text-right">\${(part.cost * part.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-2 font-semibold">Total</td>
                    <td className="py-2 text-right font-semibold">\${totalPartsCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      );
    };
  `;
}
