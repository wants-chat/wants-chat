import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePricingTableTwo = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'table' | 'comparison' = 'cards'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
import { api } from '@/lib/api';
import { Check, X, ArrowRight, Star, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    cards: `
${commonImports}

interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  features: Feature[];
  ctaText: string;
  ctaLink: string;
  recommended?: boolean;
}

interface PricingTableTwoProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableTwo: React.FC<PricingTableTwoProps> = ({
  ${dataName},
  className
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const pricingData = ${dataName} || fetchedData || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const planItems = ${getField('plans')};
  const comparePlansText = ${getField('comparePlansText')};
  const comparePlansLink = ${getField('comparePlansLink')};

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  if (isLoading && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load pricing plans</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full shadow-lg border-2 border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
                billingPeriod === 'monthly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
                billingPeriod === 'yearly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Yearly
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {planItems.map((plan: Plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative border-2 transition-all duration-500 hover:shadow-2xl group overflow-hidden",
                plan.recommended
                  ? "border-blue-600 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50"
                  : "border-gray-200 hover:border-blue-400 hover:scale-105 bg-white"
              )}
            >
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 shadow-lg animate-pulse">
                    <Star className="w-3 h-3 mr-1 inline fill-white" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 relative z-10">
                <CardTitle className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  {plan.description}
                </CardDescription>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg text-gray-500">$</span>
                    <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      {getPrice(plan.price)}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Save \${Math.floor(plan.price * 2.4)}/year
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 group/item">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </div>
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm transition-colors",
                        feature.included ? "text-gray-700 group-hover/item:text-gray-900 font-medium" : "text-gray-400"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="relative z-10">
                <Button
                  className={cn(
                    "w-full group/btn font-semibold transition-all duration-300",
                    plan.recommended
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                      : "bg-gray-900 hover:bg-gray-800 hover:shadow-md"
                  )}
                  size="lg"
                >
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Compare Plans Link */}
        <div className="text-center mb-8">
          <a
            href={comparePlansLink}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-all hover:gap-3"
          >
            {comparePlansText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
          </p>
          <p className="text-xs text-gray-500">
            <Sparkles className="w-3 h-3 inline mr-1 text-blue-600" />
            Join 10,000+ satisfied customers worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTableTwo;
    `,

    table: `
${commonImports}

interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  features: Feature[];
  ctaText: string;
  ctaLink: string;
  recommended?: boolean;
}

interface PricingTableTwoProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableTwo: React.FC<PricingTableTwoProps> = ({
  ${dataName},
  className
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const pricingData = ${dataName} || fetchedData || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const planItems = ${getField('plans')};
  const comparePlansText = ${getField('comparePlansText')};
  const comparePlansLink = ${getField('comparePlansLink')};

  // Extract unique features for table rows
  const allFeatures = planItems[0]?.features.map((f: Feature) => f.name) || [];

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  if (isLoading && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load pricing plans</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full shadow-lg border-2 border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
                billingPeriod === 'monthly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
                billingPeriod === 'yearly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Yearly
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-6 px-6 font-bold text-gray-900">
                  Features
                </th>
                {planItems.map((plan: Plan) => (
                  <th key={plan.id} className="py-6 px-6">
                    <div className="text-center">
                      {plan.recommended && (
                        <Badge className="bg-blue-600 text-white mb-3">
                          Recommended
                        </Badge>
                      )}
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </div>
                      <div className="flex flex-col items-center gap-1 mb-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm text-gray-500">$</span>
                          <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                            {getPrice(plan.price)}
                          </span>
                        </div>
                        <span className="text-gray-600 text-sm">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {plan.description}
                      </p>
                      <Button
                        className={cn(
                          "w-full",
                          plan.recommended
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        )}
                      >
                        {plan.ctaText}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((featureName: string, idx: number) => (
                <tr
                  key={idx}
                  className={cn(
                    "border-b border-gray-100",
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  )}
                >
                  <td className="py-4 px-6 text-gray-700 font-bold">
                    {featureName}
                  </td>
                  {planItems.map((plan: Plan) => {
                    const feature = plan.features.find((f: Feature) => f.name === featureName);
                    return (
                      <td key={plan.id} className="py-4 px-6 text-center">
                        {feature?.included ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compare Link */}
        <div className="text-center mt-12">
          <a
            href={comparePlansLink}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            {comparePlansText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingTableTwo;
    `,

    comparison: `
${commonImports}

interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  features: Feature[];
  ctaText: string;
  ctaLink: string;
  recommended?: boolean;
}

interface PricingTableTwoProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableTwo: React.FC<PricingTableTwoProps> = ({
  ${dataName},
  className
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const pricingData = ${dataName} || fetchedData || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const planItems = ${getField('plans')};
  const comparePlansText = ${getField('comparePlansText')};
  const comparePlansLink = ${getField('comparePlansLink')};

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  if (isLoading && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error && !${dataName}) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load pricing plans</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full shadow-lg border-2 border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
                billingPeriod === 'monthly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2",
                billingPeriod === 'yearly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Yearly
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto mb-12 overflow-hidden rounded-xl border-2 border-gray-200">
          {planItems.map((plan: Plan, planIdx: number) => (
            <div
              key={plan.id}
              className={cn(
                "bg-white",
                planIdx === 0 && "md:border-r-2 border-gray-200",
                plan.recommended && "relative"
              )}
            >
              {plan.recommended && (
                <div className="bg-blue-600 text-white text-center py-2 font-bold text-sm">
                  <Star className="w-4 h-4 mr-1 inline" />
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {plan.description}
                  </p>
                  <div className="flex flex-col items-center gap-1 mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-gray-500">$</span>
                      <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                        {getPrice(plan.price)}
                      </span>
                    </div>
                    <span className="text-gray-600">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                    {billingPeriod === 'yearly' && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Save \${Math.floor(plan.price * 2.4)}/year
                      </Badge>
                    )}
                  </div>
                  <Button
                    className={cn(
                      "w-full",
                      plan.recommended
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    )}
                    size="lg"
                  >
                    {plan.ctaText}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start gap-3 py-3 px-4 rounded-lg",
                        feature.included ? "bg-green-50" : "bg-gray-50"
                      )}
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        feature.included ? "text-gray-900 font-bold" : "text-gray-500"
                      )}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compare Link */}
        <div className="text-center">
          <a
            href={comparePlansLink}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
          >
            {comparePlansText}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingTableTwo;
    `
  };

  return variants[variant] || variants.cards;
};
