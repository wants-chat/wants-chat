/**
 * Specialized List Component Generators
 * For industry-specific list components
 */

export interface SpecializedListsOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Service Call List Today Component
 */
export function generateServiceCallListToday(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ServiceCallListTodayProps {
      calls: Array<{
        id: string;
        customer: string;
        address: string;
        phone: string;
        time: string;
        type: string;
        priority: 'normal' | 'urgent';
        status: 'scheduled' | 'en-route' | 'in-progress' | 'completed';
        technician?: string;
      }>;
      onSelect?: (id: string) => void;
      onStatusChange?: (id: string, status: string) => void;
    }

    const ServiceCallListToday: React.FC<ServiceCallListTodayProps> = ({ calls, onSelect, onStatusChange }) => {
      const statusColors = {
        scheduled: 'bg-gray-100 text-gray-800',
        'en-route': 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Today's Service Calls</h3>
            <p className="text-sm text-gray-500">{calls.length} calls scheduled</p>
          </div>
          <div className="divide-y">
            {calls.map((call) => (
              <div
                key={call.id}
                className={\`p-4 hover:bg-gray-50 \${call.priority === 'urgent' ? 'border-l-4 border-red-500' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(call.id)}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{call.customer}</span>
                      {call.priority === 'urgent' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Urgent</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{call.address}</p>
                    <p className="text-sm text-gray-500">📞 {call.phone}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[call.status]}\`}>
                    {call.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>🕐 {call.time}</span>
                    <span>🔧 {call.type}</span>
                    {call.technician && <span>👤 {call.technician}</span>}
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
 * Generate Service Call List Today Plumbing Component
 */
export function generateServiceCallListTodayPlumbing(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ServiceCallListTodayPlumbingProps {
      calls: Array<{
        id: string;
        customer: string;
        address: string;
        phone: string;
        scheduledTime: string;
        issueType: 'leak' | 'clog' | 'installation' | 'repair' | 'inspection';
        priority: 'normal' | 'emergency';
        status: 'scheduled' | 'dispatched' | 'in-progress' | 'completed';
        plumber?: string;
        estimatedDuration: string;
        notes?: string;
      }>;
      onSelect?: (id: string) => void;
      onDispatch?: (id: string) => void;
    }

    const ServiceCallListTodayPlumbing: React.FC<ServiceCallListTodayPlumbingProps> = ({ calls, onSelect, onDispatch }) => {
      const issueIcons = {
        leak: '💧',
        clog: '🚿',
        installation: '🔧',
        repair: '🛠️',
        inspection: '🔍',
      };

      const statusColors = {
        scheduled: 'bg-gray-100 text-gray-800',
        dispatched: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Today's Plumbing Calls</h3>
          </div>
          <div className="divide-y">
            {calls.map((call) => (
              <div
                key={call.id}
                className={\`p-4 \${call.priority === 'emergency' ? 'bg-red-50 border-l-4 border-red-500' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(call.id)}>
                    <div className="flex items-center gap-2">
                      <span>{issueIcons[call.issueType]}</span>
                      <span className="font-medium">{call.customer}</span>
                      {call.priority === 'emergency' && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">🚨 Emergency</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{call.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[call.status]}\`}>
                      {call.status}
                    </span>
                    {call.status === 'scheduled' && onDispatch && (
                      <button
                        onClick={() => onDispatch(call.id)}
                        className="px-3 py-1 text-xs text-white rounded hover:opacity-90"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        Dispatch
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>🕐 {call.scheduledTime}</span>
                  <span>⏱️ {call.estimatedDuration}</span>
                  <span className="capitalize">{call.issueType}</span>
                  {call.plumber && <span>👷 {call.plumber}</span>}
                </div>
                {call.notes && <p className="text-xs text-gray-400 mt-2">📝 {call.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Fitting List Today Component
 */
export function generateFittingListToday(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface FittingListTodayProps {
      fittings: Array<{
        id: string;
        customer: string;
        time: string;
        type: 'initial' | 'follow-up' | 'final';
        garments: string[];
        tailor?: string;
        status: 'scheduled' | 'in-progress' | 'completed' | 'no-show';
        notes?: string;
      }>;
      onSelect?: (id: string) => void;
      onStart?: (id: string) => void;
    }

    const FittingListToday: React.FC<FittingListTodayProps> = ({ fittings, onSelect, onStart }) => {
      const typeColors = {
        initial: 'bg-blue-100 text-blue-800',
        'follow-up': 'bg-yellow-100 text-yellow-800',
        final: 'bg-green-100 text-green-800',
      };

      const statusColors = {
        scheduled: 'text-gray-600',
        'in-progress': 'text-blue-600',
        completed: 'text-green-600',
        'no-show': 'text-red-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Today's Fittings</h3>
            <p className="text-sm text-gray-500">{fittings.length} appointments</p>
          </div>
          <div className="divide-y">
            {fittings.map((fitting) => (
              <div key={fitting.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(fitting.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">👔</span>
                      <span className="font-medium">{fitting.customer}</span>
                      <span className={\`px-2 py-0.5 rounded text-xs font-medium \${typeColors[fitting.type]}\`}>
                        {fitting.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">{fitting.garments.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className={\`text-sm font-medium \${statusColors[fitting.status]}\`}>{fitting.status}</p>
                    <p className="text-sm text-gray-500">{fitting.time}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {fitting.tailor && (
                    <p className="text-sm text-gray-500">Tailor: {fitting.tailor}</p>
                  )}
                  {fitting.status === 'scheduled' && onStart && (
                    <button
                      onClick={() => onStart(fitting.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Start Fitting
                    </button>
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
 * Generate Lens Order List Pending Component
 */
export function generateLensOrderListPending(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface LensOrderListPendingProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        prescription: {
          sphere: string;
          cylinder: string;
          axis: string;
        };
        lensType: string;
        coating: string[];
        frame: string;
        status: 'ordered' | 'in-production' | 'quality-check' | 'ready';
        estimatedReady: string;
        rush?: boolean;
      }>;
      onSelect?: (id: string) => void;
      onMarkReady?: (id: string) => void;
    }

    const LensOrderListPending: React.FC<LensOrderListPendingProps> = ({ orders, onSelect, onMarkReady }) => {
      const statusColors = {
        ordered: 'bg-gray-100 text-gray-800',
        'in-production': 'bg-blue-100 text-blue-800',
        'quality-check': 'bg-yellow-100 text-yellow-800',
        ready: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pending Lens Orders</h3>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div
                key={order.id}
                className={\`p-4 hover:bg-gray-50 \${order.rush ? 'border-l-4 border-red-500' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(order.id)}>
                    <div className="flex items-center gap-2">
                      <span>👓</span>
                      <span className="font-medium">#{order.orderNumber}</span>
                      {order.rush && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Rush</span>}
                    </div>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[order.status]}\`}>
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <p>Lens: {order.lensType}</p>
                  <p>Frame: {order.frame}</p>
                  <p>Rx: SPH {order.prescription.sphere}, CYL {order.prescription.cylinder}, AXIS {order.prescription.axis}</p>
                  <p>Coating: {order.coating.join(', ')}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Est. ready: {order.estimatedReady}</p>
                  {order.status === 'quality-check' && onMarkReady && (
                    <button
                      onClick={() => onMarkReady(order.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Mark Ready
                    </button>
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
 * Generate Prescription List Pending Component
 */
export function generatePrescriptionListPending(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PrescriptionListPendingProps {
      prescriptions: Array<{
        id: string;
        patient: string;
        medication: string;
        dosage: string;
        quantity: number;
        doctor: string;
        prescribedDate: string;
        status: 'pending' | 'processing' | 'ready' | 'picked-up';
        insurance?: string;
        copay?: number;
      }>;
      onSelect?: (id: string) => void;
      onFill?: (id: string) => void;
    }

    const PrescriptionListPending: React.FC<PrescriptionListPendingProps> = ({ prescriptions, onSelect, onFill }) => {
      const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        processing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        'picked-up': 'bg-gray-100 text-gray-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pending Prescriptions</h3>
          </div>
          <div className="divide-y">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(rx.id)}>
                    <div className="flex items-center gap-2">
                      <span>💊</span>
                      <span className="font-medium">{rx.patient}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{rx.medication} - {rx.dosage}</p>
                    <p className="text-sm text-gray-500">Qty: {rx.quantity} • Dr. {rx.doctor}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[rx.status]}\`}>
                    {rx.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span>📅 {rx.prescribedDate}</span>
                    {rx.insurance && <span className="ml-3">🏥 {rx.insurance}</span>}
                    {rx.copay !== undefined && <span className="ml-3">💵 Copay: \${rx.copay}</span>}
                  </div>
                  {rx.status === 'pending' && onFill && (
                    <button
                      onClick={() => onFill(rx.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Fill Rx
                    </button>
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
 * Generate Repair List Pending Component
 */
export function generateRepairListPending(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface RepairListPendingProps {
      repairs: Array<{
        id: string;
        ticketNumber: string;
        customer: string;
        item: string;
        issue: string;
        receivedDate: string;
        estimatedCost?: number;
        status: 'received' | 'diagnosing' | 'awaiting-parts' | 'repairing' | 'ready';
        technician?: string;
        priority: 'normal' | 'rush';
      }>;
      onSelect?: (id: string) => void;
      onUpdateStatus?: (id: string, status: string) => void;
    }

    const RepairListPending: React.FC<RepairListPendingProps> = ({ repairs, onSelect, onUpdateStatus }) => {
      const statusColors = {
        received: 'bg-gray-100 text-gray-800',
        diagnosing: 'bg-blue-100 text-blue-800',
        'awaiting-parts': 'bg-yellow-100 text-yellow-800',
        repairing: 'bg-purple-100 text-purple-800',
        ready: 'bg-green-100 text-green-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pending Repairs</h3>
          </div>
          <div className="divide-y">
            {repairs.map((repair) => (
              <div
                key={repair.id}
                className={\`p-4 hover:bg-gray-50 \${repair.priority === 'rush' ? 'border-l-4 border-red-500' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(repair.id)}>
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <span className="font-medium">#{repair.ticketNumber}</span>
                      {repair.priority === 'rush' && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Rush</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{repair.item}</p>
                    <p className="text-sm text-gray-500">{repair.customer}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[repair.status]}\`}>
                    {repair.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Issue: {repair.issue}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span>📅 Received: {repair.receivedDate}</span>
                    {repair.technician && <span className="ml-3">👤 {repair.technician}</span>}
                    {repair.estimatedCost && <span className="ml-3">💰 Est: \${repair.estimatedCost}</span>}
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
 * Generate Plant List Featured Component
 */
export function generatePlantListFeatured(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface PlantListFeaturedProps {
      plants: Array<{
        id: string;
        name: string;
        scientificName?: string;
        image?: string;
        price: number;
        sizes: Array<{ size: string; price: number }>;
        inStock: boolean;
        category: string;
        sunlight: 'full-sun' | 'partial' | 'shade';
        waterNeeds: 'low' | 'medium' | 'high';
        isNew?: boolean;
        isSale?: boolean;
        salePrice?: number;
      }>;
      onSelect?: (id: string) => void;
      onAddToCart?: (id: string, size: string) => void;
    }

    const PlantListFeatured: React.FC<PlantListFeaturedProps> = ({ plants, onSelect, onAddToCart }) => {
      const sunlightIcons = {
        'full-sun': '☀️',
        partial: '⛅',
        shade: '🌙',
      };

      const waterIcons = {
        low: '💧',
        medium: '💧💧',
        high: '💧💧💧',
      };

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {plant.image ? (
                  <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌱</div>
                )}
                {plant.isNew && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">New</span>
                )}
                {plant.isSale && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">Sale</span>
                )}
              </div>
              <div className="p-4">
                <div className="cursor-pointer" onClick={() => onSelect?.(plant.id)}>
                  <h3 className="font-semibold">{plant.name}</h3>
                  {plant.scientificName && (
                    <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span title="Sunlight">{sunlightIcons[plant.sunlight]}</span>
                  <span title="Water needs">{waterIcons[plant.waterNeeds]}</span>
                  <span className="text-gray-500">{plant.category}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    {plant.isSale && plant.salePrice ? (
                      <>
                        <span className="text-lg font-bold" style={{ color: '${primaryColor}' }}>\${plant.salePrice}</span>
                        <span className="text-sm text-gray-400 line-through ml-2">\${plant.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">\${plant.price}</span>
                    )}
                  </div>
                  {plant.inStock ? (
                    <button
                      onClick={() => onAddToCart?.(plant.id, plant.sizes[0]?.size || 'standard')}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}

/**
 * Generate Custom Order List Component
 */
export function generateCustomOrderList(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface CustomOrderListProps {
      orders: Array<{
        id: string;
        orderNumber: string;
        customer: string;
        description: string;
        specifications: Record<string, string>;
        status: 'quote-pending' | 'quote-sent' | 'approved' | 'in-production' | 'ready' | 'delivered';
        quotedPrice?: number;
        dueDate?: string;
        createdAt: string;
      }>;
      onSelect?: (id: string) => void;
      onSendQuote?: (id: string) => void;
    }

    const CustomOrderList: React.FC<CustomOrderListProps> = ({ orders, onSelect, onSendQuote }) => {
      const statusColors = {
        'quote-pending': 'bg-yellow-100 text-yellow-800',
        'quote-sent': 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        'in-production': 'bg-purple-100 text-purple-800',
        ready: 'bg-emerald-100 text-emerald-800',
        delivered: 'bg-gray-100 text-gray-600',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Custom Orders</h3>
          </div>
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(order.id)}>
                    <div className="flex items-center gap-2">
                      <span>🎨</span>
                      <span className="font-medium">#{order.orderNumber}</span>
                    </div>
                    <p className="text-sm text-gray-700">{order.customer}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{order.description}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded text-xs font-medium whitespace-nowrap \${statusColors[order.status]}\`}>
                    {order.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <div className="text-gray-500">
                    <span>📅 {order.createdAt}</span>
                    {order.dueDate && <span className="ml-3">⏰ Due: {order.dueDate}</span>}
                    {order.quotedPrice && <span className="ml-3">💰 \${order.quotedPrice}</span>}
                  </div>
                  {order.status === 'quote-pending' && onSendQuote && (
                    <button
                      onClick={() => onSendQuote(order.id)}
                      className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                      style={{ backgroundColor: '${primaryColor}' }}
                    >
                      Send Quote
                    </button>
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
 * Generate Event Registrations Component
 */
export function generateEventRegistrations(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface EventRegistrationsProps {
      registrations: Array<{
        id: string;
        attendee: string;
        email: string;
        ticketType: string;
        quantity: number;
        total: number;
        registeredAt: string;
        status: 'confirmed' | 'pending' | 'cancelled';
        checkedIn?: boolean;
      }>;
      onSelect?: (id: string) => void;
      onCheckIn?: (id: string) => void;
      onResend?: (id: string) => void;
    }

    const EventRegistrations: React.FC<EventRegistrationsProps> = ({ registrations, onSelect, onCheckIn, onResend }) => {
      const statusColors = {
        confirmed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Registrations</h3>
            <span className="text-sm text-gray-500">
              {registrations.filter(r => r.checkedIn).length}/{registrations.length} checked in
            </span>
          </div>
          <div className="divide-y">
            {registrations.map((reg) => (
              <div key={reg.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(reg.id)}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reg.attendee}</span>
                      {reg.checkedIn && <span className="text-green-500">✓ Checked In</span>}
                    </div>
                    <p className="text-sm text-gray-500">{reg.email}</p>
                    <p className="text-sm text-gray-500">
                      {reg.quantity}x {reg.ticketType} • \${reg.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={\`px-2 py-1 rounded text-xs font-medium \${statusColors[reg.status]}\`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Registered: {reg.registeredAt}</p>
                  <div className="flex gap-2">
                    {reg.status === 'confirmed' && !reg.checkedIn && onCheckIn && (
                      <button
                        onClick={() => onCheckIn(reg.id)}
                        className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        Check In
                      </button>
                    )}
                    {reg.status === 'confirmed' && onResend && (
                      <button
                        onClick={() => onResend(reg.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        Resend Email
                      </button>
                    )}
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
 * Generate Expiring Rentals Component
 */
export function generateExpiringRentals(options: SpecializedListsOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface ExpiringRentalsProps {
      rentals: Array<{
        id: string;
        customer: string;
        item: string;
        startDate: string;
        endDate: string;
        daysRemaining: number;
        dailyRate: number;
        totalDue: number;
        status: 'active' | 'overdue' | 'returned';
      }>;
      onSelect?: (id: string) => void;
      onExtend?: (id: string) => void;
      onReturn?: (id: string) => void;
    }

    const ExpiringRentals: React.FC<ExpiringRentalsProps> = ({ rentals, onSelect, onExtend, onReturn }) => {
      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Expiring Rentals</h3>
          </div>
          <div className="divide-y">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className={\`p-4 \${rental.status === 'overdue' ? 'bg-red-50' : rental.daysRemaining <= 2 ? 'bg-yellow-50' : ''}\`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="cursor-pointer" onClick={() => onSelect?.(rental.id)}>
                    <p className="font-medium">{rental.item}</p>
                    <p className="text-sm text-gray-500">{rental.customer}</p>
                  </div>
                  <div className="text-right">
                    {rental.status === 'overdue' ? (
                      <span className="text-red-600 font-medium">Overdue</span>
                    ) : (
                      <span className={\`font-medium \${rental.daysRemaining <= 2 ? 'text-orange-600' : ''}\`}>
                        {rental.daysRemaining} days left
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    <span>{rental.startDate} - {rental.endDate}</span>
                    <span className="ml-3">\${rental.dailyRate}/day</span>
                  </div>
                  <div className="flex gap-2">
                    {rental.status !== 'returned' && onExtend && (
                      <button
                        onClick={() => onExtend(rental.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        Extend
                      </button>
                    )}
                    {rental.status !== 'returned' && onReturn && (
                      <button
                        onClick={() => onReturn(rental.id)}
                        className="px-3 py-1 text-sm text-white rounded hover:opacity-90"
                        style={{ backgroundColor: '${primaryColor}' }}
                      >
                        Return
                      </button>
                    )}
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
