import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePricingTableMulti = (
  resolved: ResolvedComponent,
  variant: 'scroll' | 'grid' | 'accordion' = 'scroll'
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
import { api } from '@/lib/api';
import { Check, X, ArrowRight, ChevronDown, ChevronUp, Star, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    scroll: `
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
  recommended?: boolean;
}

interface PricingTableMultiProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableMulti: React.FC<PricingTableMultiProps> = ({
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

  if (isLoading && !${dataName}) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error && !${dataName}) {
    return (
      <section className={cn("py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load pricing plans</p>
        </div>
      </section>
    );
  }
  const planItems = ${getField('plans')};

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  const getSavings = () => {
    return '20% off';
  };

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 animate-fade-in">
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
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                {getSavings()}
              </Badge>
            </button>
          </div>
        </div>

        {/* Scrollable Plans Container */}
        <div className="relative">
          {/* Desktop: Grid */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-6">
            {planItems.map((plan: Plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "border-2 transition-all duration-500 flex flex-col hover:scale-105 hover:shadow-2xl group relative overflow-hidden",
                  plan.recommended
                    ? "border-blue-600 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50"
                    : "border-gray-200 hover:border-blue-400 bg-white"
                )}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs shadow-lg animate-pulse">
                      <Star className="w-3 h-3 mr-1 inline fill-white" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 relative z-10">
                  <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm mb-4 min-h-[2.5rem]">
                    {plan.description}
                  </CardDescription>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xs text-gray-500">$</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                        {getPrice(plan.price)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                    {billingPeriod === 'yearly' && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] mt-1">
                        <TrendingUp className="w-2.5 h-2.5 mr-1" />
                        Save \${Math.floor(plan.price * 2.4)}/year
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-grow px-4 relative z-10">
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 group/item">
                        {feature.included ? (
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "transition-colors",
                          feature.included ? "text-gray-700 group-hover/item:text-gray-900" : "text-gray-400"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6 relative z-10">
                  <Button
                    className={cn(
                      "w-full text-xs font-semibold transition-all duration-300 group/btn",
                      plan.recommended
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                        : "bg-gray-900 hover:bg-gray-800 hover:shadow-md"
                    )}
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-3 h-3 ml-1 inline group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Mobile/Tablet: Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto pb-8 scrollbar-hide">
            <div className="flex gap-6 min-w-max px-4">
              {planItems.map((plan: Plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    "w-80 border-2 transition-all duration-300 flex flex-col flex-shrink-0 relative overflow-hidden group",
                    plan.recommended
                      ? "border-blue-600 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50"
                      : "border-gray-200 bg-white"
                  )}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                        <Star className="w-3 h-3 mr-1 inline fill-white" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-6 relative z-10">
                    <CardTitle className="text-xl font-bold mb-2">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm mb-4">
                      {plan.description}
                    </CardDescription>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-gray-500">$</span>
                        <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                          {getPrice(plan.price)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </span>
                      {billingPeriod === 'yearly' && (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Save \${Math.floor(plan.price * 2.4)}/year
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow relative z-10">
                    <ul className="space-y-3.5">
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
                            feature.included ? "text-gray-700 group-hover/item:text-gray-900" : "text-gray-400"
                          )}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6 relative z-10">
                    <Button
                      className={cn(
                        "w-full font-semibold transition-all duration-300 group/btn",
                        plan.recommended
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                          : "bg-gray-900 hover:bg-gray-800 hover:shadow-md"
                      )}
                      size="lg"
                    >
                      {plan.ctaText}
                      <ArrowRight className="w-4 h-4 ml-2 inline group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Scroll Indicator - Mobile Only */}
          <div className="lg:hidden text-center mt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <p className="text-sm font-medium text-blue-700">
                Swipe to explore all plans
              </p>
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16 space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
          </p>
          <p className="text-xs text-gray-500">
            Join 10,000+ satisfied customers worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTableMulti;
    `,

    grid: `
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
  recommended?: boolean;
}

interface PricingTableMultiProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableMulti: React.FC<PricingTableMultiProps> = ({
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

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {planItems.map((plan: Plan) => (
            <Card
              key={plan.id}
              className={cn(
                "border-2 transition-all duration-300 hover:shadow-xl flex flex-col",
                plan.recommended
                  ? "border-blue-600 shadow-lg ring-2 ring-blue-600 ring-opacity-50"
                  : "border-gray-200 hover:border-blue-300"
              )}
            >
              {plan.recommended && (
                <div className="bg-blue-600 text-white text-center py-2 text-xs font-bold">
                  RECOMMENDED
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm mb-4 min-h-[3rem]">
                  {plan.description}
                </CardDescription>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-gray-500">$</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      {getPrice(plan.price)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] mt-1">
                      <TrendingUp className="w-2.5 h-2.5 mr-1" />
                      Save \${Math.floor(plan.price * 2.4)}/year
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs",
                        feature.included ? "text-gray-700" : "text-gray-400"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  className={cn(
                    "w-full text-sm font-semibold transition-all duration-300 group/btn",
                    plan.recommended
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                      : "bg-gray-900 hover:bg-gray-800 hover:shadow-md"
                  )}
                >
                  {plan.ctaText}
                  <ArrowRight className="w-3 h-3 ml-1 inline group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16 space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
          </p>
          <p className="text-xs text-gray-500">
            Join 10,000+ satisfied customers worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTableMulti;
    `,

    accordion: `
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
  recommended?: boolean;
}

interface PricingTableMultiProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableMulti: React.FC<PricingTableMultiProps> = ({
  ${dataName},
  className
}) => {
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [showAllFeatures, setShowAllFeatures] = useState(false);
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

  const togglePlan = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const getVisibleFeatures = (features: Feature[]) => {
    return showAllFeatures ? features : features.slice(0, 4);
  };

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white p-1.5 rounded-full shadow-lg border-2 border-gray-200 mb-6">
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

        {/* Toggle All Features */}
        <div className="mb-6 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="group"
          >
            {showAllFeatures ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less Features
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All Features
              </>
            )}
          </Button>
        </div>

        {/* Accordion Plans */}
        <div className="space-y-4">
          {planItems.map((plan: Plan) => {
            const isExpanded = expandedPlans.has(plan.id);

            return (
              <Card
                key={plan.id}
                className={cn(
                  "border-2 transition-all duration-300",
                  plan.recommended
                    ? "border-blue-600 shadow-lg"
                    : "border-gray-200"
                )}
              >
                {/* Plan Header - Always Visible */}
                <button
                  onClick={() => togglePlan(plan.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-bold">
                          {plan.name}
                        </CardTitle>
                        {plan.recommended && (
                          <Badge className="bg-blue-600 text-white">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm text-gray-500">$</span>
                            <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                              {getPrice(plan.price)}
                            </span>
                          </div>
                          <span className="text-gray-600 text-sm">
                            /{billingPeriod === 'monthly' ? 'month' : 'year'}
                          </span>
                          {billingPeriod === 'yearly' && (
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs mt-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Save \${Math.floor(plan.price * 2.4)}/year
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                </button>

                {/* Expandable Content */}
                {isExpanded && (
                  <CardContent className="border-t pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Features */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4">
                          Features Included:
                        </h4>
                        <ul className="space-y-3">
                          {getVisibleFeatures(plan.features).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              {feature.included ? (
                                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={cn(
                                "text-sm",
                                feature.included ? "text-gray-700" : "text-gray-400"
                              )}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {!showAllFeatures && plan.features.length > 4 && (
                          <p className="text-sm text-gray-500 mt-3">
                            +{plan.features.length - 4} more features
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col justify-center">
                        <Button
                          className={cn(
                            "w-full group/btn mb-4 font-semibold transition-all duration-300",
                            plan.recommended
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                              : "bg-gray-900 hover:bg-gray-800 hover:shadow-md"
                          )}
                          size="lg"
                        >
                          {plan.ctaText}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          <Sparkles className="w-3 h-3 inline mr-1 text-blue-600" />
                          14-day free trial • No credit card required
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingTableMulti;
    `
  };

  return variants[variant] || variants.scroll;
};
