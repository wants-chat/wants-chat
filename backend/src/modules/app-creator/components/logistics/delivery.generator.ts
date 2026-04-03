/**
 * Delivery Component Generators
 *
 * Generates delivery scheduling and tracking components.
 */

export interface DeliveryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDeliverySchedule(options: DeliveryOptions = {}): string {
  const { componentName = 'DeliverySchedule', endpoint = '/deliveries' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Truck, Clock, MapPin, Package, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { api } from '@/lib/api';

interface Delivery {
  id: string;
  order_number: string;
  customer_name: string;
  address: string;
  time_slot: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'failed';
  driver?: string;
  vehicle?: string;
  items_count: number;
  priority: 'normal' | 'high' | 'urgent';
}

interface ${componentName}Props {
  driverId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  driverId,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['delivery-schedule', selectedDate.toISOString().split('T')[0], driverId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('date', selectedDate.toISOString().split('T')[0]);
      if (driverId) params.append('driver_id', driverId);
      const response = await api.get<any>(\`${endpoint}/schedule?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  ];

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
    in_transit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    normal: 'bg-gray-400',
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getDeliveriesForSlot = (slot: string) => {
    return deliveries?.filter((d: Delivery) => d.time_slot === slot) || [];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Schedule</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'day' ? 'week' : 'day')}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {view === 'day' ? 'Week View' : 'Day View'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-500">
              {deliveries?.length || 0} deliveries scheduled
            </p>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {timeSlots.map((slot) => {
            const slotDeliveries = getDeliveriesForSlot(slot);

            return (
              <div
                key={slot}
                className="flex border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {/* Time Label */}
                <div className="w-20 shrink-0 py-3 pr-4 text-right">
                  <span className="text-sm font-medium text-gray-500">{slot}</span>
                </div>

                {/* Deliveries */}
                <div className="flex-1 py-2 min-h-[60px]">
                  {slotDeliveries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {slotDeliveries.map((delivery: Delivery) => (
                        <div
                          key={delivery.id}
                          className={\`flex-1 min-w-[200px] max-w-[300px] p-3 rounded-lg border \${statusColors[delivery.status]}\`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={\`w-2 h-2 rounded-full \${priorityColors[delivery.priority]}\`} />
                              <span className="font-medium text-sm">#{delivery.order_number}</span>
                            </div>
                            <span className="text-xs capitalize">{delivery.status.replace('_', ' ')}</span>
                          </div>

                          <p className="text-sm font-medium mb-1">{delivery.customer_name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{delivery.address}</span>
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {delivery.items_count} items
                            </span>
                            {delivery.driver && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {delivery.driver}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center">
                      <span className="text-sm text-gray-400">No deliveries</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDeliveryTracker(options: DeliveryOptions = {}): string {
  const { componentName = 'DeliveryTracker', endpoint = '/deliveries' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Truck, MapPin, Clock, Package, Phone, User, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { api } from '@/lib/api';

interface DeliveryDetails {
  id: string;
  order_number: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered' | 'failed';
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  driver?: {
    name: string;
    phone: string;
    avatar_url?: string;
    vehicle: string;
    license_plate: string;
  };
  estimated_arrival?: string;
  actual_arrival?: string;
  current_location?: {
    address: string;
    lat: number;
    lng: number;
    updated_at: string;
  };
  stops_remaining?: number;
  proof_of_delivery?: {
    signature_url?: string;
    photo_url?: string;
    recipient_name?: string;
    timestamp: string;
  };
}

interface ${componentName}Props {
  deliveryId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  deliveryId: propId,
  className = '',
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const deliveryId = propId || paramId;

  const { data: delivery, isLoading, error } = useQuery({
    queryKey: ['delivery-tracker', deliveryId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${deliveryId}\`);
      return response?.data || response;
    },
    enabled: !!deliveryId,
    refetchInterval: 30000,
  });

  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: Package },
    { key: 'assigned', label: 'Driver Assigned', icon: User },
    { key: 'picked_up', label: 'Picked Up', icon: Package },
    { key: 'in_transit', label: 'In Transit', icon: Truck },
    { key: 'arriving', label: 'Arriving Soon', icon: Navigation },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (!delivery) return 0;
    if (delivery.status === 'failed') return -1;
    return statusSteps.findIndex((s) => s.key === delivery.status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Unable to load delivery information</p>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Order #{delivery.order_number}</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {delivery.status === 'delivered' ? 'Delivered!' : 'Tracking Your Delivery'}
            </h2>
          </div>
          {delivery.estimated_arrival && delivery.status !== 'delivered' && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Estimated Arrival</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(delivery.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={\`relative z-10 w-10 h-10 rounded-full flex items-center justify-center \${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  } \${isCurrent ? 'ring-4 ring-green-200 dark:ring-green-900' : ''}\`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={\`mt-2 text-xs text-center \${isCompleted ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}\`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: \`\${(currentStepIndex / (statusSteps.length - 1)) * 100}%\` }}
            />
          </div>
        </div>

        {/* Current Location */}
        {delivery.current_location && delivery.status === 'in_transit' && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Current Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{delivery.current_location.address}</p>
                {delivery.stops_remaining !== undefined && (
                  <p className="text-sm text-gray-500">{delivery.stops_remaining} stops before yours</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Driver Card */}
      {delivery.driver && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Driver</h3>
          <div className="flex items-center gap-4">
            {delivery.driver.avatar_url ? (
              <img
                src={delivery.driver.avatar_url}
                alt={delivery.driver.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{delivery.driver.name}</p>
              <p className="text-sm text-gray-500">{delivery.driver.vehicle}</p>
              <p className="text-sm text-gray-400">{delivery.driver.license_plate}</p>
            </div>
            <a
              href={\`tel:\${delivery.driver.phone}\`}
              className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Delivery Address</h3>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{delivery.customer.name}</p>
            <p className="text-gray-500">{delivery.customer.address}</p>
            <a
              href={\`tel:\${delivery.customer.phone}\`}
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {delivery.customer.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Proof of Delivery */}
      {delivery.proof_of_delivery && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Proof of Delivery</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Received by</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {delivery.proof_of_delivery.recipient_name || 'Not specified'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Delivered at</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(delivery.proof_of_delivery.timestamp).toLocaleString()}
              </span>
            </div>
            {delivery.proof_of_delivery.signature_url && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Signature</p>
                <img
                  src={delivery.proof_of_delivery.signature_url}
                  alt="Signature"
                  className="h-20 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
            {delivery.proof_of_delivery.photo_url && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Photo</p>
                <img
                  src={delivery.proof_of_delivery.photo_url}
                  alt="Delivery photo"
                  className="w-full max-w-xs rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateRoutePlanner(options: DeliveryOptions = {}): string {
  const { componentName = 'RoutePlanner', endpoint = '/deliveries/routes' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Truck, Clock, Route, Plus, GripVertical, Trash2, Play, RefreshCw, Navigation } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Stop {
  id: string;
  order_number: string;
  customer_name: string;
  address: string;
  time_window?: { start: string; end: string };
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'skipped';
  sequence: number;
  estimated_arrival?: string;
  actual_arrival?: string;
}

interface RouteData {
  id: string;
  driver_id: string;
  driver_name: string;
  vehicle: string;
  date: string;
  status: 'planning' | 'active' | 'completed';
  stops: Stop[];
  total_distance?: number;
  total_duration?: number;
  optimized?: boolean;
}

interface ${componentName}Props {
  routeId?: string;
  driverId?: string;
  date?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  routeId,
  driverId,
  date = new Date().toISOString().split('T')[0],
  className = '',
}) => {
  const queryClient = useQueryClient();
  const [draggedStop, setDraggedStop] = useState<string | null>(null);

  const { data: route, isLoading } = useQuery({
    queryKey: ['route-planner', routeId, driverId, date],
    queryFn: async () => {
      let url = '${endpoint}';
      if (routeId) url += \`/\${routeId}\`;
      else {
        const params = new URLSearchParams();
        if (driverId) params.append('driver_id', driverId);
        params.append('date', date);
        url += '?' + params.toString();
      }
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const optimizeRoute = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${route?.id}/optimize\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
      toast.success('Route optimized successfully');
    },
  });

  const updateSequence = useMutation({
    mutationFn: (stops: { id: string; sequence: number }[]) =>
      api.put(\`${endpoint}/\${route?.id}/sequence\`, { stops }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
    },
  });

  const removeStop = useMutation({
    mutationFn: (stopId: string) =>
      api.delete(\`${endpoint}/\${route?.id}/stops/\${stopId}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
      toast.success('Stop removed');
    },
  });

  const startRoute = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${route?.id}/start\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
      toast.success('Route started');
    },
  });

  const handleDragStart = (stopId: string) => {
    setDraggedStop(stopId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedStop || draggedStop === targetId) return;
  };

  const handleDrop = (targetId: string) => {
    if (!draggedStop || draggedStop === targetId || !route) return;

    const stops = [...route.stops];
    const draggedIndex = stops.findIndex((s) => s.id === draggedStop);
    const targetIndex = stops.findIndex((s) => s.id === targetId);

    const [removed] = stops.splice(draggedIndex, 1);
    stops.splice(targetIndex, 0, removed);

    const updatedSequence = stops.map((stop, index) => ({
      id: stop.id,
      sequence: index + 1,
    }));

    updateSequence.mutate(updatedSequence);
    setDraggedStop(null);
  };

  const priorityColors: Record<string, string> = {
    urgent: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
    high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
    normal: 'border-l-gray-300 bg-white dark:bg-gray-800',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    skipped: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No route found for this date</p>
      </div>
    );
  }

  const completedStops = route.stops.filter((s: Stop) => s.status === 'completed').length;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Route className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Route Plan</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {route.driver_name} - {route.vehicle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {route.status === 'planning' && (
              <>
                <button
                  onClick={() => optimizeRoute.mutate()}
                  disabled={optimizeRoute.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {optimizeRoute.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Optimize
                </button>
                <button
                  onClick={() => startRoute.mutate()}
                  disabled={startRoute.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Start Route
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{route.stops.length} stops</span>
          </div>
          {route.total_distance && (
            <div className="flex items-center gap-2 text-gray-500">
              <Navigation className="w-4 h-4" />
              <span>{(route.total_distance / 1000).toFixed(1)} km</span>
            </div>
          )}
          {route.total_duration && (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{Math.round(route.total_duration / 60)} min</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="text-gray-500">
            {completedStops} / {route.stops.length} completed
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: \`\${(completedStops / route.stops.length) * 100}%\` }}
          />
        </div>
      </div>

      {/* Stops List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {route.stops
          .sort((a: Stop, b: Stop) => a.sequence - b.sequence)
          .map((stop: Stop, index: number) => (
            <div
              key={stop.id}
              draggable={route.status === 'planning'}
              onDragStart={() => handleDragStart(stop.id)}
              onDragOver={(e) => handleDragOver(e, stop.id)}
              onDrop={() => handleDrop(stop.id)}
              className={\`p-4 border-l-4 \${priorityColors[stop.priority]} \${draggedStop === stop.id ? 'opacity-50' : ''}\`}
            >
              <div className="flex items-start gap-3">
                {route.status === 'planning' && (
                  <div className="cursor-grab mt-1">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      #{stop.order_number}
                    </span>
                    <span className={\`px-2 py-0.5 rounded text-xs font-medium \${statusColors[stop.status]}\`}>
                      {stop.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 dark:text-white">{stop.customer_name}</p>
                  <p className="text-sm text-gray-500 truncate">{stop.address}</p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {stop.time_window && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stop.time_window.start} - {stop.time_window.end}
                      </span>
                    )}
                    {stop.estimated_arrival && (
                      <span>ETA: {new Date(stop.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>

                {route.status === 'planning' && (
                  <button
                    onClick={() => removeStop.mutate(stop.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      {route.status === 'planning' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add Stop
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTruckSchedule(options: DeliveryOptions = {}): string {
  const { componentName = 'TruckSchedule', endpoint = '/vehicles' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Truck, Calendar, Clock, MapPin, User, Wrench, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface VehicleSchedule {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  license_plate: string;
  type: 'van' | 'truck' | 'trailer';
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  driver?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  current_route?: {
    id: string;
    stops_count: number;
    completed_stops: number;
    estimated_return: string;
  };
  scheduled_maintenance?: string;
  next_assignment?: {
    date: string;
    route_name: string;
    driver_name: string;
  };
}

interface ${componentName}Props {
  date?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  date: initialDate,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : new Date());

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['truck-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/schedule?date=\${selectedDate.toISOString().split('T')[0]}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    in_use: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    maintenance: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    offline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const vehicleIcons: Record<string, string> = {
    van: 'Van',
    truck: 'Truck',
    trailer: 'Trailer',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const availableCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'available').length || 0;
  const inUseCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'in_use').length || 0;
  const maintenanceCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'maintenance').length || 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Schedule</h2>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-500">Available: {availableCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-500">In Use: {inUseCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-500">Maintenance: {maintenanceCount}</span>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {vehicles && vehicles.length > 0 ? (
          vehicles.map((vehicle: VehicleSchedule) => (
            <div key={vehicle.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-gray-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {vehicle.vehicle_name}
                    </span>
                    <span className={\`px-2 py-0.5 rounded text-xs font-medium \${statusColors[vehicle.status]}\`}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {vehicle.license_plate} - {vehicleIcons[vehicle.type]} - Capacity: {vehicle.capacity}
                  </p>

                  {vehicle.driver && (
                    <div className="flex items-center gap-2 mt-2">
                      {vehicle.driver.avatar_url ? (
                        <img
                          src={vehicle.driver.avatar_url}
                          alt={vehicle.driver.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.driver.name}
                      </span>
                    </div>
                  )}

                  {vehicle.current_route && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-600 dark:text-blue-400">Active Route</span>
                        <span className="text-gray-500">
                          {vehicle.current_route.completed_stops} / {vehicle.current_route.stops_count} stops
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 mt-2">
                        <div
                          className="h-1.5 rounded-full bg-blue-600"
                          style={{ width: \`\${(vehicle.current_route.completed_stops / vehicle.current_route.stops_count) * 100}%\` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Est. return: {new Date(vehicle.current_route.estimated_return).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  {vehicle.scheduled_maintenance && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-400">
                        Maintenance scheduled: {new Date(vehicle.scheduled_maintenance).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {vehicle.next_assignment && vehicle.status === 'available' && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Next Assignment</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.next_assignment.route_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(vehicle.next_assignment.date).toLocaleDateString()} - {vehicle.next_assignment.driver_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No vehicles found
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
