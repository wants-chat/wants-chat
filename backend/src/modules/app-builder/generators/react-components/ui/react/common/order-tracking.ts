import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOrderTracking = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string | null => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `trackingData.${mapping.sourceField}`;
    }
    // Return fallback value
    const fallback = mapping?.fallback;
    if (fallback === null || fallback === undefined) {
      // For ID fields
      if (fieldName === 'id' || fieldName.endsWith('Id')) {
        return `\${trackingData.id || trackingData._id}`;
      }
      // For array fields
      if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders/i)) {
        return `\${trackingData.\${fieldName} || ([] as any[])}`;
      }
      // For object fields
      if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
        return `\${trackingData.\${fieldName} || ({} as any)}`;
      }
      // For scalar values
      return `\${trackingData.\${fieldName} || ''}`;
    }
    if (typeof fallback === 'string') {
      return `'${fallback.replace(/'/g, "\\'")}'`;
    }
    if (typeof fallback === 'object') {
      return JSON.stringify(fallback);
    }
    return String(fallback);
  };

  // Parse data source for clean prop naming
  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart : 'data';
  };

  const dataName = getDataPath();

  return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Circle, Package, Truck, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackingStep {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  icon?: React.ReactNode;
}

interface OrderTrackingProps {
  ${dataName}?: any;
  steps?: TrackingStep[];
  currentStep?: number;
  orderId?: string;
  orderDate?: string;
  estimatedDelivery?: string;
  onTrackOrder?: (data?: any) => void;
  className?: string;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  ${dataName},
  steps: propSteps,
  currentStep: propCurrentStep,
  orderId: propOrderId,
  orderDate: propOrderDate,
  estimatedDelivery: propEstimatedDelivery,
  onTrackOrder,
  className
}) => {
  const trackingData = ${dataName} || {};

  const orderId = propOrderId || ${getField('orderId') || `trackingData.orderId`} || '#ORD-2024-001';
  const orderDate = propOrderDate || ${getField('orderDate') || `trackingData.orderDate`} || new Date().toLocaleDateString();
  const estimatedDelivery = propEstimatedDelivery || ${getField('estimatedDelivery') || `trackingData.estimatedDelivery`} || 'In 3-5 business days';
  const currentStepIndex = propCurrentStep !== undefined ? propCurrentStep : (${getField('currentStep') || `trackingData.currentStep`} ?? 1);

  const defaultSteps: TrackingStep[] = propSteps || ${getField('steps') || `trackingData.steps`} || [
    {
      id: 'placed',
      label: 'Order Placed',
      description: 'Your order has been received',
      status: 'completed',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'confirmed',
      label: 'Order Confirmed',
      description: 'Order confirmed and being prepared',
      status: currentStepIndex >= 1 ? 'completed' : 'pending',
      icon: <Check className="w-5 h-5" />
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description: 'Your order is on the way',
      status: currentStepIndex >= 2 ? 'completed' : currentStepIndex === 1 ? 'active' : 'pending',
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: 'delivered',
      label: 'Delivered',
      description: 'Order has been delivered',
      status: currentStepIndex >= 3 ? 'completed' : currentStepIndex === 2 ? 'active' : 'pending',
      icon: <Home className="w-5 h-5" />
    }
  ];

  const steps = defaultSteps;

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 border-green-500 text-white',
          line: 'bg-green-500',
          text: 'text-gray-900 dark:text-gray-100',
          description: 'text-gray-600 dark:text-gray-400'
        };
      case 'active':
        return {
          circle: 'bg-blue-500 border-blue-500 text-white animate-pulse',
          line: 'bg-gray-300 dark:bg-gray-600',
          text: 'text-blue-600 dark:text-blue-400 font-semibold',
          description: 'text-blue-600 dark:text-blue-400'
        };
      default:
        return {
          circle: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
          line: 'bg-gray-300 dark:bg-gray-600',
          text: 'text-gray-500 dark:text-gray-400',
          description: 'text-gray-400 dark:text-gray-500'
        };
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Tracking</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Order ID: {orderId}
            </p>
          </div>
          {onTrackOrder && (
            <Button variant="outline" onClick={onTrackOrder}>
              Track Order
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Order Date: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{orderDate}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Estimated Delivery: </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{estimatedDelivery}</span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="relative">
          {steps.map((step, index) => {
            const classes = getStepClasses(step.status);
            const isLastStep = index === steps.length - 1;

            return (
              <div key={step.id} className="relative pb-8 last:pb-0">
                <div className="flex items-start gap-4">
                  {/* Circle with Icon */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={\`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 \${classes.circle}\`}
                    >
                      {step.status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : step.status === 'active' ? (
                        step.icon || <Circle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    {/* Connecting Line */}
                    {!isLastStep && (
                      <div
                        className={\`absolute top-10 w-0.5 h-full \${classes.line}\`}
                        style={{ left: '50%', transform: 'translateX(-50%)' }}
                      ></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className={\`text-base font-medium \${classes.text}\`}>
                      {step.label}
                    </h3>
                    {step.description && (
                      <p className={\`text-sm mt-1 \${classes.description}\`}>
                        {step.description}
                      </p>
                    )}
                    {step.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
  `.trim();
};