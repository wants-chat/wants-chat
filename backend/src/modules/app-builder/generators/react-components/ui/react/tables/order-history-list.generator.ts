import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderHistoryList = (
  resolved: ResolvedComponent,
  variant: 'list' | 'cards' | 'table' = 'list'
) => {
  const dataSource = resolved.dataSource;
  const fields = resolved.fieldMappings || [];
  const props = resolved.props || {};

  // Get title from props or resolved component
  const pageTitle = resolved.title || props.title || 'My Orders';
  const pageDescription = props.description || `View and track all your ${dataSource || 'orders'}`;

  // Get detail route from props (e.g., '/booking/confirmation/:id')
  const itemDetailRoute = props.itemDetailRoute || `/account/${dataSource || 'orders'}/:id`;

  // Get fetch action route from actions (dynamic from catalog)
  const fetchAction = resolved.actions?.find(a => a.type === 'fetch' && a.trigger === 'onLoad');
  const fetchRoute = fetchAction?.serverFunction?.route?.replace('/api/v1/', '/') || `/${dataSource || 'orders'}`;
  const queryKey = fetchRoute.replace(/\//g, '-').replace(/^-/, '') || dataSource || 'orders';

  // Find key fields - support travel booking fields
  const nameField = fields.find(f => f.targetField === 'name' || f.targetField === 'customer_name' || f.targetField === 'provider_name')?.targetField || 'provider_name';
  const dateField = fields.find(f => f.targetField === 'created_at' || f.targetField.includes('date'))?.targetField || 'created_at';
  const statusField = fields.find(f => f.targetField === 'status')?.targetField || 'status';
  const priceField = fields.find(f => f.targetField === 'cost' || f.targetField === 'price' || f.targetField === 'amount')?.targetField || 'cost';
  const referenceField = fields.find(f => f.targetField === 'booking_reference' || f.targetField === 'order_number')?.targetField || 'booking_reference';
  const typeField = fields.find(f => f.targetField === 'booking_type')?.targetField || null;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, User, Eye, Loader2, AlertCircle, Plane, Bed, Mountain, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface OrderHistoryListProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

export default function OrderHistoryList({ className }: OrderHistoryListProps) {
  const navigate = useNavigate();
  const entity = '${dataSource || 'orders'}';
  const detailRouteTemplate = '${itemDetailRoute}';

  // Fetch data from API - route is dynamic from catalog config
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get('${fetchRoute}', { requireAuth: true }) as any;
        // Handle both response formats: { data: [...] } or [...] directly
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        // Return empty array if unauthorized or other error
        console.log('Unable to fetch data:', err);
        return [];
      }
    },
    retry: false
  });

  const data = Array.isArray(fetchedData) ? fetchedData : [];
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter by status
  const filteredData = statusFilter === 'all'
    ? data
    : data.filter((item: any) => item.${statusField}?.toLowerCase() === statusFilter.toLowerCase());

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    switch (normalized) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  };

  const handleViewDetails = (item: any) => {
    const itemId = item.id || item._id;
    if (itemId) {
      // Use dynamic route from catalog config
      const route = detailRouteTemplate.replace(':id', itemId);
      navigate(route);
    }
  };

  // Get icon based on booking type
  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Bed className="w-5 h-5" />;
      case 'tour':
      case 'activity':
        return <Mountain className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  // Get unique statuses for filter
  const statuses = ['all', ...new Set(data.map((item: any) => item.${statusField}?.toLowerCase() || 'pending'))];

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
            <span className="text-red-600 dark:text-red-400 font-medium">Failed to load data</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${pageTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">${pageDescription}</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* List */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No ${dataSource || 'items'} found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' ? 'You haven\\'t made any ${dataSource || 'bookings'} yet' : \`No \${statusFilter} ${dataSource || 'items'}\`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item: any) => {
              const id = item.id || item._id;
              const reference = item.${referenceField} || item.order_number || \`#\${id?.slice(0, 8).toUpperCase()}\`;
              const createdAt = item.created_at || item.${dateField} || item.order_date;
              const ${statusField} = item.${statusField} || 'pending';
              const totalAmount = item.${priceField} || item.total_amount || item.total || 0;
              const providerName = item.${nameField} || item.provider_name || '';
              const bookingType = item.${typeField || 'booking_type'} || item.type || '';
              const location = item.location || '';
              const startDate = item.start_date;
              const endDate = item.end_date;

              return (
                <Card
                  key={id}
                  className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(item)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          {bookingType && (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                              {getTypeIcon(bookingType)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {providerName || reference}
                              </h3>
                              {bookingType && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded capitalize">
                                  {bookingType}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {reference}
                            </p>
                            {location && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {location}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={cn("capitalize h-fit", getStatusColor(${statusField}))}>
                          {${statusField}}
                        </Badge>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Amount */}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(totalAmount)}
                          </p>
                        </div>

                        {/* Start Date */}
                        {startDate && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {bookingType === 'hotel' ? 'Check-in' : bookingType === 'flight' ? 'Departure' : 'Start'}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(startDate)}
                            </p>
                          </div>
                        )}

                        {/* End Date */}
                        {endDate && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {bookingType === 'hotel' ? 'Check-out' : bookingType === 'flight' ? 'Arrival' : 'End'}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(endDate)}
                            </p>
                          </div>
                        )}

                        {/* Booked On */}
                        {createdAt && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booked On</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(createdAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(item);
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
`;
};
