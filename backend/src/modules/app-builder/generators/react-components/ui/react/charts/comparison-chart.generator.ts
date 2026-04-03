import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateComparisonChart = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'sideBySide' = 'table'
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
    return `/${dataSource || 'comparison'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'comparison';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, X, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    table: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

interface Feature {
  name: string;
  values: (string | boolean)[];
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

interface ComparisonChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const comparisonData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const products = ${getField('products')};
  const featureCategories = ${getField('featureCategories')};

  const renderValue = (value: string | boolean, isHighlighted: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={cn(
          "w-5 h-5 mx-auto",
          isHighlighted ? "text-blue-600" : "text-green-600"
        )} />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      );
    }
    return (
      <span className={cn(
        "text-sm font-medium",
        isHighlighted ? "text-blue-600" : "text-gray-700"
      )}>
        {value}
      </span>
    );
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Sticky Header */}
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="text-left py-6 px-6 font-semibold text-gray-900 border-b-2 border-gray-200">
                  Features
                </th>
                {products.map((product: Product) => (
                  <th
                    key={product.id}
                    className={cn(
                      "py-6 px-6 border-b-2",
                      product.highlighted
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="text-center">
                      {product.highlighted && (
                        <Badge className="bg-blue-600 text-white mb-3">
                          <Star className="w-3 h-3 mr-1 inline" />
                          Popular
                        </Badge>
                      )}
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {product.description}
                      </p>
                      <div className="flex items-baseline justify-center gap-1 mb-4">
                        <span className="text-3xl font-bold">\${product.price}</span>
                        <span className="text-gray-600 text-sm">/{product.billingPeriod}</span>
                      </div>
                      <Button
                        className={cn(
                          "w-full",
                          product.highlighted
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        )}
                        size="sm"
                      >
                        {product.ctaText}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {featureCategories.map((category: FeatureCategory, categoryIdx: number) => (
                <React.Fragment key={categoryIdx}>
                  {/* Category Header */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={products.length + 1}
                      className="py-4 px-6 font-semibold text-gray-900"
                    >
                      {category.name}
                    </td>
                  </tr>

                  {/* Category Features */}
                  {category.features.map((feature: Feature, featureIdx: number) => (
                    <tr
                      key={featureIdx}
                      className={cn(
                        "border-b border-gray-100",
                        featureIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      )}
                    >
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {feature.name}
                      </td>
                      {feature.values.map((value, valueIdx) => {
                        const product = products[valueIdx];
                        return (
                          <td
                            key={valueIdx}
                            className={cn(
                              "py-4 px-6 text-center",
                              product?.highlighted && "bg-blue-50"
                            )}
                          >
                            {renderValue(value, product?.highlighted || false)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonChart;
    `,

    cards: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

interface Feature {
  name: string;
  values: (string | boolean)[];
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

interface ComparisonChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const comparisonData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const products = ${getField('products')};
  const featureCategories = ${getField('featureCategories')};

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      );
    }
    return <span className="text-sm font-medium text-gray-700">{value}</span>;
  };

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product: Product, productIdx: number) => (
            <Card
              key={product.id}
              className={cn(
                "border-2 flex flex-col",
                product.highlighted
                  ? "border-blue-600 shadow-xl"
                  : "border-gray-200"
              )}
            >
              {product.highlighted && (
                <div className="bg-blue-600 text-white text-center py-2 font-semibold text-sm">
                  <Star className="w-4 h-4 mr-1 inline" />
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold mb-2">
                  {product.name}
                </CardTitle>
                <CardDescription className="mb-4">
                  {product.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    \${product.price}
                  </span>
                  <span className="text-gray-600">/{product.billingPeriod}</span>
                </div>
                <Button
                  className={cn(
                    "w-full",
                    product.highlighted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  )}
                  size="lg"
                >
                  {product.ctaText}
                </Button>
              </CardHeader>

              <CardContent className="flex-grow">
                {featureCategories.map((category: FeatureCategory, categoryIdx: number) => (
                  <div key={categoryIdx} className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                      {category.name}
                    </h4>
                    <ul className="space-y-3">
                      {category.features.map((feature: Feature, featureIdx: number) => (
                        <li key={featureIdx} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-gray-600">
                            {feature.name}
                          </span>
                          {renderValue(feature.values[productIdx])}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonChart;
    `,

    sideBySide: `
${commonImports}

interface Product {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
}

interface Feature {
  name: string;
  values: (string | boolean)[];
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

interface ComparisonChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const comparisonData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const products = ${getField('products')};
  const featureCategories = ${getField('featureCategories')};

  const renderValue = (value: string | boolean, isHighlighted: boolean) => {
    if (typeof value === 'boolean') {
      return (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          value
            ? isHighlighted
              ? "bg-blue-100"
              : "bg-green-100"
            : "bg-gray-100"
        )}>
          {value ? (
            <Check className={cn(
              "w-5 h-5",
              isHighlighted ? "text-blue-600" : "text-green-600"
            )} />
          ) : (
            <X className="w-5 h-5 text-gray-400" />
          )}
        </div>
      );
    }
    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-sm font-medium",
        isHighlighted
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700"
      )}>
        {value}
      </span>
    );
  };

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Side by Side Comparison */}
        <div className="max-w-6xl mx-auto">
          {/* Product Headers */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="col-span-1"></div>
            {products.map((product: Product) => (
              <div
                key={product.id}
                className={cn(
                  "text-center p-6 rounded-lg border-2",
                  product.highlighted
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                )}
              >
                {product.highlighted && (
                  <Badge className="bg-blue-600 text-white mb-3">
                    Popular
                  </Badge>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-3xl font-bold">\${product.price}</span>
                  <span className="text-gray-600 text-sm">/{product.billingPeriod}</span>
                </div>
                <Button
                  className={cn(
                    "w-full",
                    product.highlighted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  )}
                >
                  {product.ctaText}
                </Button>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="space-y-8">
            {featureCategories.map((category: FeatureCategory, categoryIdx: number) => (
              <div key={categoryIdx}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-6">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.features.map((feature: Feature, featureIdx: number) => (
                    <div
                      key={featureIdx}
                      className={cn(
                        "grid grid-cols-4 gap-6 items-center py-4 px-6 rounded-lg",
                        featureIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      )}
                    >
                      <div className="col-span-1 font-medium text-gray-700">
                        {feature.name}
                      </div>
                      {feature.values.map((value, valueIdx) => {
                        const product = products[valueIdx];
                        return (
                          <div key={valueIdx} className="flex justify-center">
                            {renderValue(value, product?.highlighted || false)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonChart;
    `
  };

  return variants[variant] || variants.table;
};
