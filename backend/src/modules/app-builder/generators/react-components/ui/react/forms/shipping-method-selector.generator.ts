import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateShippingMethodSelector = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'radio' | 'detailed' = 'cards'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Truck, Zap, Rocket, Check, Clock, Shield, MapPin, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    cards: `
${commonImports}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
}

interface ShippingMethodSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (methodId: string, price: number) => void;
}

const ShippingMethodSelectorComponent: React.FC<ShippingMethodSelectorProps> = ({
  ${dataName},
  className,
  onSelect
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const shippingData = propData || fetchedData || {};

  const [selectedMethod, setSelectedMethod] = useState('standard');

  const shippingTitle = ${getField('shippingTitle')};
  const estimatedDeliveryLabel = ${getField('estimatedDeliveryLabel')};
  const shippingMethods = ${getField('shippingMethodsCards')};

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      truck: Truck,
      zap: Zap,
      rocket: Rocket
    };
    const IconComponent = icons[iconName] || Truck;
    return <IconComponent className="w-6 h-6" />;
  };

  // Event handlers
  const handleSelect = (method: ShippingMethod) => {
    setSelectedMethod(method.id);
    if (onSelect) {
      onSelect(method.id, method.price);
    }
    console.log('Shipping method selected:', method);
    alert(\`\${method.name} selected\\n\${method.description}\\nCost: \${method.price === 0 ? 'Free' : '$' + Number(method.price).toFixed(2)}\`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {shippingTitle}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shippingMethods.map((method: ShippingMethod) => (
          <button
            key={method.id}
            onClick={() => handleSelect(method)}
            className={cn(
              "relative p-6 rounded-lg border-2 transition-all text-left",
              selectedMethod === method.id
                ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            {/* Selection Indicator */}
            {selectedMethod === method.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-4",
              selectedMethod === method.id
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {getIcon(method.icon)}
            </div>

            {/* Content */}
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {method.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {method.description}
            </p>

            {/* Price & Delivery */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {estimatedDeliveryLabel}: {method.estimatedDays}
              </span>
              <span className={cn(
                "text-lg font-bold",
                selectedMethod === method.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-white"
              )}>
                {method.price === 0 ? 'Free' : \`$\${Number(method.price).toFixed(2)}\`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethodSelectorComponent;
    `,

    radio: `
${commonImports}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

interface ShippingMethodSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (methodId: string, price: number) => void;
}

const ShippingMethodSelectorComponent: React.FC<ShippingMethodSelectorProps> = ({
  ${dataName},
  className,
  onSelect
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const shippingData = propData || fetchedData || {};

  const [selectedMethod, setSelectedMethod] = useState('standard');

  const shippingTitle = ${getField('shippingTitle')};
  const freeShippingLabel = ${getField('freeShippingLabel')};
  const shippingMethods = ${getField('shippingMethodsRadio')};

  // Event handlers
  const handleSelect = (method: ShippingMethod) => {
    setSelectedMethod(method.id);
    if (onSelect) {
      onSelect(method.id, method.price);
    }
    console.log('Shipping method selected:', method);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {shippingTitle}
      </h3>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {shippingMethods.map((method: ShippingMethod) => (
          <label
            key={method.id}
            className={cn(
              "flex items-center p-4 cursor-pointer transition-colors",
              selectedMethod === method.id
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
            )}
          >
            {/* Radio Button */}
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="shipping-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => handleSelect(method)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {method.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {method.estimatedDays}
                </p>
              </div>

              {/* Price */}
              <div className="text-right">
                {method.price === 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {freeShippingLabel}
                  </span>
                ) : (
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    \${Number(method.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethodSelectorComponent;
    `,

    detailed: `
${commonImports}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  cutoffTime: string;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
}

interface ShippingMethodSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (methodId: string, price: number) => void;
}

const ShippingMethodSelectorComponent: React.FC<ShippingMethodSelectorProps> = ({
  ${dataName},
  className,
  onSelect
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const shippingData = propData || fetchedData || {};

  const [selectedMethod, setSelectedMethod] = useState('standard');

  const deliveryTitle = ${getField('deliveryTitle')};
  const freeShippingLabel = ${getField('freeShippingLabel')};
  const shippingMethods = ${getField('shippingMethodsDetailed')};

  // Event handlers
  const handleSelect = (method: ShippingMethod) => {
    setSelectedMethod(method.id);
    if (onSelect) {
      onSelect(method.id, method.price);
    }
    console.log('Shipping method selected:', method);
    alert(\`\${method.name}\\n\${method.description}\\nOrder before \${method.cutoffTime} for delivery in \${method.estimatedDays}\`);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {deliveryTitle}
      </h3>

      <div className="space-y-4">
        {shippingMethods.map((method: ShippingMethod, index: number) => (
          <div
            key={method.id}
            onClick={() => handleSelect(method)}
            className={cn(
              "relative p-6 rounded-xl border-2 cursor-pointer transition-all",
              selectedMethod === method.id
                ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            {/* Selection Indicator */}
            {selectedMethod === method.id && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                selectedMethod === method.id
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              )}>
                {index === 0 ? <Truck className="w-6 h-6" /> :
                 index === 1 ? <Zap className="w-6 h-6" /> :
                 <Rocket className="w-6 h-6" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {method.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    {method.price === 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {freeShippingLabel}
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        \${Number(method.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{method.estimatedDays}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Order by {method.cutoffTime}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-3 flex gap-4">
                  {method.trackingIncluded && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Tracking included
                    </span>
                  )}
                  {method.insuranceIncluded && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Insurance included
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingMethodSelectorComponent;
    `
  };

  return variants[variant] || variants.cards;
};
