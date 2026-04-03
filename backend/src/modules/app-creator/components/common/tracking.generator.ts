/**
 * Tracking Generator
 *
 * Generates TrackingInfo components with:
 * - Order/shipment tracking display
 * - Timeline visualization
 * - Status updates
 * - Estimated delivery
 * - Tracking number display
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface TrackingStep {
  status: string;
  label: string;
  description?: string;
}

export interface TrackingInfoOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  trackingSteps?: TrackingStep[];
  showMap?: boolean;
  showCarrier?: boolean;
  showEstimatedDelivery?: boolean;
}

/**
 * Generate a TrackingInfo component
 */
export function generateTrackingInfo(options: TrackingInfoOptions = {}): string {
  const {
    entity = 'shipment',
    trackingSteps = [
      { status: 'ordered', label: 'Order Placed', description: 'Your order has been confirmed' },
      { status: 'processing', label: 'Processing', description: 'Order is being prepared' },
      { status: 'shipped', label: 'Shipped', description: 'Package has been dispatched' },
      { status: 'in_transit', label: 'In Transit', description: 'Package is on its way' },
      { status: 'out_for_delivery', label: 'Out for Delivery', description: 'Package is with courier' },
      { status: 'delivered', label: 'Delivered', description: 'Package has been delivered' },
    ],
    showMap = false,
    showCarrier = true,
    showEstimatedDelivery = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'TrackingInfo';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface TrackingUpdate {
  id: string;
  status: string;
  location?: string;
  timestamp: string;
  description?: string;
}

interface TrackingData {
  id: string;
  trackingNumber: string;
  carrier?: string;
  carrierUrl?: string;
  status: string;
  estimatedDelivery?: string;
  origin?: string;
  destination?: string;
  updates: TrackingUpdate[];
  weight?: string;
  dimensions?: string;
}

interface ${componentName}Props {
  className?: string;
  trackingId?: string;
  data?: TrackingData;
  onRefresh?: () => void;
}

const trackingSteps = ${JSON.stringify(trackingSteps, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  trackingId: propTrackingId,
  data: propData,
  onRefresh,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const trackingId = propTrackingId || paramId;
  const [copied, setCopied] = useState(false);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', trackingId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${trackingId}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch tracking:', err);
        return null;
      }
    },
    enabled: !!trackingId && !propData,
    refetchInterval: 60000, // Refresh every minute
  });

  const trackingData = propData || fetchedData;

  const copyTrackingNumber = async () => {
    if (!trackingData?.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(trackingData.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    else refetch();
  };

  const getCurrentStepIndex = () => {
    if (!trackingData?.status) return -1;
    return trackingSteps.findIndex(
      (step) => step.status.toLowerCase() === trackingData.status.toLowerCase()
    );
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'text-green-600 dark:text-green-400',
      out_for_delivery: 'text-blue-600 dark:text-blue-400',
      in_transit: 'text-blue-600 dark:text-blue-400',
      shipped: 'text-blue-600 dark:text-blue-400',
      processing: 'text-yellow-600 dark:text-yellow-400',
      ordered: 'text-gray-600 dark:text-gray-400',
      cancelled: 'text-red-600 dark:text-red-400',
      exception: 'text-red-600 dark:text-red-400',
    };
    return colors[status.toLowerCase()] || 'text-gray-600 dark:text-gray-400';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-8 text-center', className)}>
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Tracking information not found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Track Your Order
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tracking Number:
              </span>
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                {trackingData.trackingNumber}
              </code>
              <button
                onClick={copyTrackingNumber}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Copy tracking number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full',
              trackingData.status === 'delivered'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-blue-100 dark:bg-blue-900/30'
            )}>
              {trackingData.status === 'delivered' ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <p className={cn('font-semibold', getStatusColor(trackingData.status))}>
                {trackingSteps.find(s => s.status === trackingData.status)?.label || trackingData.status}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {trackingSteps.find(s => s.status === trackingData.status)?.description}
              </p>
            </div>
          </div>
          ${showEstimatedDelivery ? `{trackingData.estimatedDelivery && trackingData.status !== 'delivered' && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Est. Delivery:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(trackingData.estimatedDelivery)}
              </span>
            </div>
          )}` : ''}
        </div>

        ${showCarrier ? `{/* Carrier Info */}
        {trackingData.carrier && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Carrier:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {trackingData.carrier}
              </span>
            </div>
            {trackingData.carrierUrl && (
              <a
                href={trackingData.carrierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Track on carrier site
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}` : ''}
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Shipping Progress
        </h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div
            className="absolute left-4 top-8 w-0.5 bg-blue-600 transition-all duration-500"
            style={{
              height: currentStepIndex >= 0
                ? \`calc(\${(currentStepIndex / (trackingSteps.length - 1)) * 100}% - 32px)\`
                : '0%'
            }}
          />

          {/* Steps */}
          <div className="space-y-6">
            {trackingSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex items-start gap-4">
                  <div className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={cn(
                      'font-medium',
                      isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    )}>
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    )}
                    {isCurrent && trackingData.updates?.[0] && (
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDateTime(trackingData.updates[0].timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tracking Updates */}
      {trackingData.updates && trackingData.updates.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tracking History
          </h3>
          <div className="space-y-4">
            {trackingData.updates.map((update, index) => (
              <div
                key={update.id || index}
                className={cn(
                  'flex gap-4 pb-4',
                  index !== trackingData.updates.length - 1 && 'border-b border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="flex-shrink-0">
                  <div className={cn(
                    'w-2 h-2 mt-2 rounded-full',
                    index === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {update.description || update.status}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(update.timestamp)}
                    </p>
                  </div>
                  {update.location && (
                    <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      {update.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Package Details */}
      {(trackingData.origin || trackingData.destination || trackingData.weight) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Package Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trackingData.origin && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                <p className="font-medium text-gray-900 dark:text-white">{trackingData.origin}</p>
              </div>
            )}
            {trackingData.destination && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                <p className="font-medium text-gray-900 dark:text-white">{trackingData.destination}</p>
              </div>
            )}
            {trackingData.weight && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                <p className="font-medium text-gray-900 dark:text-white">{trackingData.weight}</p>
              </div>
            )}
            {trackingData.dimensions && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dimensions</p>
                <p className="font-medium text-gray-900 dark:text-white">{trackingData.dimensions}</p>
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

/**
 * Generate tracking component with custom steps
 */
export function generateCustomTrackingInfo(
  steps: TrackingStep[],
  options?: Partial<TrackingInfoOptions>
): string {
  return generateTrackingInfo({
    trackingSteps: steps,
    ...options,
  });
}
