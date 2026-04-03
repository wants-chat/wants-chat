/**
 * Shipment Component Generators
 *
 * Generates shipment tracking and management components.
 */

export interface ShipmentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateShipmentMap(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentMap', endpoint = '/shipments' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Truck, Package, Navigation, RefreshCw, Maximize2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Shipment {
  id: string;
  tracking_number: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  current_location?: {
    address: string;
    lat: number;
    lng: number;
  };
  carrier?: string;
  estimated_delivery?: string;
}

interface ${componentName}Props {
  shipmentId?: string;
  showControls?: boolean;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  shipmentId,
  showControls = true,
  className = '',
}) => {
  const [selectedShipment, setSelectedShipment] = useState<string | null>(shipmentId || null);
  const [mapView, setMapView] = useState<'all' | 'single'>('all');

  const { data: shipments, isLoading, refetch } = useQuery({
    queryKey: ['shipments-map', shipmentId],
    queryFn: async () => {
      const url = shipmentId ? \`${endpoint}/\${shipmentId}\` : '${endpoint}?status=in_transit,out_for_delivery';
      const response = await api.get<any>(url);
      return shipmentId ? [response?.data || response] : (Array.isArray(response) ? response : (response?.data || []));
    },
    refetchInterval: 30000,
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-500',
    in_transit: 'bg-blue-500',
    out_for_delivery: 'bg-orange-500',
    delivered: 'bg-green-500',
    exception: 'bg-red-500',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const activeShipments = shipments?.filter((s: Shipment) => s.status !== 'delivered') || [];
  const selected = shipments?.find((s: Shipment) => s.id === selectedShipment);

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden \${className}\`}>
      {showControls && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Tracking</h2>
            <span className="text-sm text-gray-500">({activeShipments.length} active)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setMapView(mapView === 'all' ? 'single' : 'all')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Map Placeholder */}
        <div className="flex-1 h-96 lg:h-[500px] bg-gray-100 dark:bg-gray-900 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Map Integration</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Connect your mapping provider</p>
            </div>
          </div>

          {/* Shipment Markers */}
          {activeShipments.map((shipment: Shipment, index: number) => (
            <button
              key={shipment.id}
              onClick={() => setSelectedShipment(shipment.id)}
              className={\`absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 \${statusColors[shipment.status]} \${selectedShipment === shipment.id ? 'ring-4 ring-white scale-125' : ''}\`}
              style={{
                top: \`\${20 + (index * 15) % 60}%\`,
                left: \`\${20 + (index * 20) % 60}%\`,
              }}
            >
              <Truck className="w-4 h-4 text-white" />
            </button>
          ))}
        </div>

        {/* Shipment List */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 max-h-96 lg:max-h-[500px] overflow-y-auto">
          {activeShipments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeShipments.map((shipment: Shipment) => (
                <button
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment.id)}
                  className={\`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors \${selectedShipment === shipment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}\`}
                >
                  <div className="flex items-start gap-3">
                    <div className={\`w-3 h-3 rounded-full mt-1.5 \${statusColors[shipment.status]}\`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {shipment.tracking_number}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {shipment.destination?.address}
                      </p>
                      {shipment.estimated_delivery && (
                        <p className="text-xs text-gray-400 mt-1">
                          ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No active shipments
            </div>
          )}
        </div>
      </div>

      {/* Selected Shipment Details */}
      {selected && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{selected.tracking_number}</p>
              <p className="text-sm text-gray-500">{selected.carrier || 'Standard Carrier'}</p>
            </div>
            <span className={\`px-3 py-1 rounded-full text-xs font-medium text-white \${statusColors[selected.status]}\`}>
              {selected.status.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Origin</p>
              <p className="text-gray-900 dark:text-white">{selected.origin?.address}</p>
            </div>
            <div>
              <p className="text-gray-500">Destination</p>
              <p className="text-gray-900 dark:text-white">{selected.destination?.address}</p>
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

export function generateShipmentFilters(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentFilters' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, Truck, X } from 'lucide-react';

interface FilterState {
  search: string;
  status: string[];
  carrier: string;
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  onFilterChange: (filters: FilterState) => void;
  carriers?: string[];
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  carriers = ['FedEx', 'UPS', 'DHL', 'USPS'],
  className = '',
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    carrier: '',
    dateRange: { start: '', end: '' },
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
    { value: 'in_transit', label: 'In Transit', color: 'bg-blue-500' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-500' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
    { value: 'exception', label: 'Exception', color: 'bg-red-500' },
  ];

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const clearFilters = () => {
    const cleared = { search: '', status: [], carrier: '', dateRange: { start: '', end: '' } };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.status.length > 0 || filters.carrier || filters.dateRange.start;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${className}\`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number, address..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Carrier Select */}
        <select
          value={filters.carrier}
          onChange={(e) => updateFilters({ carrier: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Carriers</option>
          {carriers.map((carrier) => (
            <option key={carrier} value={carrier}>{carrier}</option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${showAdvanced ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}\`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Status Filters */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={\`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors \${
                    filters.status.includes(option.value)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  <div className={\`w-2 h-2 rounded-full \${option.color}\`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ship Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ship Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

export function generateShipmentTimeline(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentTimeline', endpoint = '/shipments' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Package, Truck, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  is_current?: boolean;
}

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  carrier: string;
  estimated_delivery?: string;
  events: TrackingEvent[];
}

interface ${componentName}Props {
  shipmentId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  shipmentId: propId,
  className = '',
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const shipmentId = propId || paramId;

  const { data: shipment, isLoading, error } = useQuery({
    queryKey: ['shipment-timeline', shipmentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${shipmentId}\`);
      return response?.data || response;
    },
    enabled: !!shipmentId,
    refetchInterval: 60000,
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'picked_up':
      case 'label_created':
        return Package;
      case 'in_transit':
      case 'departed':
      case 'arrived':
        return Truck;
      case 'out_for_delivery':
        return MapPin;
      case 'delivered':
        return CheckCircle;
      case 'exception':
      case 'delayed':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (status.toLowerCase() === 'delivered') return 'bg-green-500 text-white';
    if (status.toLowerCase() === 'exception' || status.toLowerCase() === 'delayed') return 'bg-red-500 text-white';
    if (isCurrent) return 'bg-blue-500 text-white';
    return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Unable to load shipment tracking</p>
      </div>
    );
  }

  const events = shipment.events || [];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{shipment.tracking_number}</p>
            <p className="text-sm text-gray-500 mt-1">{shipment.carrier}</p>
          </div>
          <div className="text-right">
            <span className={\`inline-flex px-3 py-1 rounded-full text-sm font-medium \${
              shipment.status === 'delivered'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : shipment.status === 'exception'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }\`}>
              {shipment.status.replace('_', ' ')}
            </span>
            {shipment.estimated_delivery && (
              <p className="text-sm text-gray-500 mt-2">
                ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {events.length > 0 ? (
          <div className="space-y-0">
            {events.map((event: TrackingEvent, index: number) => {
              const Icon = getStatusIcon(event.status);
              const isLast = index === events.length - 1;

              return (
                <div key={event.id || index} className="relative flex gap-4">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}

                  {/* Icon */}
                  <div className={\`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${getStatusColor(event.status, event.is_current || false)}\`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {event.description || event.status.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tracking events available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateShipmentFiltersWarehouse(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentFiltersWarehouse' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, Warehouse, ArrowDownUp, X, Download } from 'lucide-react';

interface WarehouseFilterState {
  search: string;
  warehouse: string;
  zone: string;
  priority: string[];
  shipmentType: string;
  dateRange: { start: string; end: string };
  sortBy: string;
}

interface ${componentName}Props {
  onFilterChange: (filters: WarehouseFilterState) => void;
  warehouses?: Array<{ id: string; name: string }>;
  zones?: string[];
  onExport?: () => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  warehouses = [],
  zones = ['A', 'B', 'C', 'D', 'Receiving', 'Shipping'],
  onExport,
  className = '',
}) => {
  const [filters, setFilters] = useState<WarehouseFilterState>({
    search: '',
    warehouse: '',
    zone: '',
    priority: [],
    shipmentType: '',
    dateRange: { start: '', end: '' },
    sortBy: 'date_desc',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'normal', label: 'Normal', color: 'bg-blue-500' },
    { value: 'low', label: 'Low', color: 'bg-gray-500' },
  ];

  const shipmentTypes = ['Inbound', 'Outbound', 'Transfer', 'Return'];
  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
    { value: 'destination', label: 'Destination' },
  ];

  const updateFilters = (updates: Partial<WarehouseFilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const togglePriority = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    updateFilters({ priority: newPriority });
  };

  const clearFilters = () => {
    const cleared: WarehouseFilterState = {
      search: '',
      warehouse: '',
      zone: '',
      priority: [],
      shipmentType: '',
      dateRange: { start: '', end: '' },
      sortBy: 'date_desc',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.warehouse || filters.zone || filters.priority.length > 0 || filters.shipmentType || filters.dateRange.start;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${className}\`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search shipments, SKU, PO number..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Warehouse Select */}
        {warehouses.length > 0 && (
          <select
            value={filters.warehouse}
            onChange={(e) => updateFilters({ warehouse: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        )}

        {/* Zone Select */}
        <select
          value={filters.zone}
          onChange={(e) => updateFilters({ zone: e.target.value })}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Zones</option>
          {zones.map((zone) => (
            <option key={zone} value={zone}>Zone {zone}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="relative">
          <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${showAdvanced ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}\`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => togglePriority(option.value)}
                  className={\`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors \${
                    filters.priority.includes(option.value)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  <div className={\`w-2 h-2 rounded-full \${option.color}\`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shipment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shipment Type
            </label>
            <select
              value={filters.shipmentType}
              onChange={(e) => updateFilters({ shipmentType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {shipmentTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>{type}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
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
