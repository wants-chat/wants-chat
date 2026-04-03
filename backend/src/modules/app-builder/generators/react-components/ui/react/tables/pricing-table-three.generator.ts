import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePricingTableThree = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'highlighted' | 'enterprise' = 'cards'
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
    // Special case for 'plans': API might return array directly (membership_plans entity) or nested {plans: [...]}
    if (fieldName === 'plans') {
      return `(Array.isArray(${dataName}) ? ${dataName} : ${dataName}?.${fieldName} || ([] as any[]))`;
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
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, X, ArrowRight, Star, Zap, Crown, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    cards: `
${commonImports}

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration_months?: number;
  description?: string;
  features?: string;
  is_active?: boolean;
  popular?: boolean;
}

interface PricingTableThreeProps {
  ${dataName}?: any;
  data?: any;
  className?: string;
  signupRoute?: string;
  checkoutRoute?: string;
  onGetStarted?: (plan: MembershipPlan) => void;
  [key: string]: any;
}

const PricingTableThree: React.FC<PricingTableThreeProps> = ({
  ${dataName},
  data,
  className,
  signupRoute = '/signup',
  checkoutRoute = '/checkout/:id',
  onGetStarted
}) => {
  const navigate = useNavigate();

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle both array directly or nested plans object - check multiple prop names
  const inputData = ${dataName} || data || fetchedData;
  const planList: MembershipPlan[] = Array.isArray(inputData)
    ? inputData
    : inputData?.plans || inputData?.data || [];

  if (isLoading) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load membership plans</p>
        </div>
      </section>
    );
  }

  // Parse features from string/array to array
  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    // Already an array
    if (Array.isArray(features)) return features;
    // String that needs parsing
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [features];
      } catch {
        return features.split(',').map((f: string) => f.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Get icon based on plan index/price
  const getPlanIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    return icons[index % icons.length];
  };

  // Get gradient colors based on index
  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-amber-500 to-orange-500',
    ];
    return gradients[index % gradients.length];
  };

  // Handle get started button click
  const handleGetStarted = (plan: MembershipPlan) => {
    if (onGetStarted) {
      onGetStarted(plan);
    } else if (checkoutRoute) {
      // Navigate to checkout page with plan id
      const route = checkoutRoute.replace(':id', plan.id);
      navigate(route);
    } else if (signupRoute) {
      // Navigate to signup with plan info
      const route = signupRoute.includes('?')
        ? \`\${signupRoute}&plan=\${plan.id}\`
        : \`\${signupRoute}?plan=\${plan.id}\`;
      navigate(route);
    }
  };

  if (!planList || planList.length === 0) {
    return (
      <section className={cn("py-16 bg-gradient-to-br from-slate-50 to-blue-50", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No membership plans available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 sm:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Membership Plans
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Flexible membership options designed to fit your fitness goals and lifestyle
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planList.map((plan: MembershipPlan, index: number) => {
            const Icon = getPlanIcon(index);
            const gradient = getGradient(index);
            const features = parseFeatures(plan.features);
            const isPopular = index === 1 || plan.popular;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative border-0 transition-all duration-500 flex flex-col h-full group overflow-hidden rounded-2xl",
                  isPopular
                    ? "shadow-2xl scale-105 ring-2 ring-purple-500 ring-offset-2"
                    : "shadow-xl hover:shadow-2xl hover:scale-[1.02]"
                )}
              >
                {/* Top Gradient Bar */}
                <div className={cn("h-2 bg-gradient-to-r", gradient)} />

                {/* Animated Background */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                  gradient
                )} />

                {isPopular && (
                  <div className="absolute -top-0 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-t-none rounded-b-lg shadow-lg">
                      <Star className="w-3 h-3 mr-1 inline fill-white" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8 pb-4 relative z-10">
                  {/* Plan Icon */}
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    gradient
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>

                  {plan.description && (
                    <CardDescription className="text-gray-600 min-h-[2.5rem] line-clamp-2">
                      {plan.description}
                    </CardDescription>
                  )}

                  {/* Price */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-gray-500">$</span>
                      <span className={cn(
                        "text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                        gradient
                      )}>
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-gray-500 mt-1">
                      {plan.duration_months === 1 ? '/month' :
                       plan.duration_months === 12 ? '/year' :
                       \`/\${plan.duration_months} months\`}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow px-6 relative z-10">
                  {features.length > 0 && (
                    <ul className="space-y-3">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5",
                            gradient
                          )}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>

                <CardFooter className="px-6 pb-8 relative z-10">
                  <Button
                    onClick={() => handleGetStarted(plan)}
                    className={cn(
                      "w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 group/btn",
                      isPopular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                        : cn("bg-gradient-to-r text-white shadow-md hover:shadow-lg", gradient)
                    )}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-14 space-y-3">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No joining fee
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Free trial available
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingTableThree;
    `,

    highlighted: `
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
  popular?: boolean;
}

interface PricingTableThreeProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableThree: React.FC<PricingTableThreeProps> = ({
  ${dataName},
  className
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pricingData = ${dataName} || fetchedData || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const planItems = ${getField('plans')};

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  if (isLoading) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-16", className)}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-400">Failed to load pricing plans</p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-800 p-1.5 rounded-full shadow-lg border-2 border-gray-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
                billingPeriod === 'monthly'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-300 hover:text-white"
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
                  : "text-gray-300 hover:text-white"
              )}
            >
              Yearly
              <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
          {planItems.map((plan: Plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative border-2 transition-all duration-300 flex flex-col",
                plan.popular
                  ? "bg-gradient-to-br from-blue-600 to-purple-600 border-transparent shadow-2xl md:scale-110 text-white"
                  : "bg-gray-800 border-gray-700 hover:border-blue-500 text-white"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-yellow-400 text-gray-900 px-4 py-1.5 shadow-lg">
                    <Zap className="w-3 h-3 mr-1 inline fill-gray-900" />
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className={cn(
                  "text-2xl font-bold mb-2",
                  plan.popular ? "text-white" : "text-white"
                )}>
                  {plan.name}
                </CardTitle>
                <CardDescription className={cn(
                  "mb-6 min-h-[3rem]",
                  plan.popular ? "text-blue-100" : "text-gray-400"
                )}>
                  {plan.description}
                </CardDescription>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-lg text-gray-300">$</span>
                    <span className={cn(
                      "text-5xl font-bold",
                      plan.popular ? "text-white" : "text-white"
                    )}>
                      {getPrice(plan.price)}
                    </span>
                  </div>
                  <span className={cn(
                    plan.popular ? "text-blue-100" : "text-gray-400"
                  )}>
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                  {billingPeriod === 'yearly' && (
                    <Badge variant="outline" className="text-green-400 border-green-400 text-xs mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Save \${Math.floor(plan.price * 2.4)}/year
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={cn(
                          "w-5 h-5 mt-0.5 flex-shrink-0",
                          plan.popular ? "text-green-300" : "text-green-500"
                        )} />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        feature.included
                          ? plan.popular ? "text-white" : "text-gray-200"
                          : "text-gray-600"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={cn(
                    "w-full group",
                    plan.popular
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                  size="lg"
                >
                  {plan.ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTableThree;
    `,

    enterprise: `
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
  popular?: boolean;
}

interface PricingTableThreeProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PricingTableThree: React.FC<PricingTableThreeProps> = ({
  ${dataName},
  className
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pricingData = ${dataName} || fetchedData || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const planItems = ${getField('plans')};

  const getIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    const Icon = icons[index] || Star;
    return Icon;
  };

  const getPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.floor(price * 10) : price;
  };

  if (isLoading) {
    return (
      <section className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16", className)}>
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </section>
    );
  }

  if (error) {
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

        {/* Pricing Cards - Enterprise Style */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {planItems.map((plan: Plan, index: number) => {
            const Icon = getIcon(index);
            const isEnterprise = plan.id === 'enterprise';

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative border-2 transition-all duration-300 overflow-hidden",
                  plan.popular
                    ? "border-blue-600 shadow-lg"
                    : "border-gray-200 hover:border-blue-300"
                )}
              >
                {/* Gradient Header */}
                <div className={cn(
                  "h-2",
                  index === 0 && "bg-gradient-to-r from-blue-400 to-blue-600",
                  index === 1 && "bg-gradient-to-r from-purple-400 to-purple-600",
                  index === 2 && "bg-gradient-to-r from-yellow-400 to-orange-600"
                )}></div>

                {plan.popular && (
                  <div className="absolute top-8 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-12">
                  {/* Icon */}
                  <div className={cn(
                    "w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center",
                    index === 0 && "bg-blue-100",
                    index === 1 && "bg-purple-100",
                    index === 2 && "bg-yellow-100"
                  )}>
                    <Icon className={cn(
                      "w-8 h-8",
                      index === 0 && "text-blue-600",
                      index === 1 && "text-purple-600",
                      index === 2 && "text-yellow-600"
                    )} />
                  </div>

                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mb-6 min-h-[3rem]">
                    {plan.description}
                  </CardDescription>

                  {isEnterprise ? (
                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      Custom
                    </div>
                  ) : (
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
                  )}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0",
                            index === 0 && "bg-blue-100",
                            index === 1 && "bg-purple-100",
                            index === 2 && "bg-yellow-100"
                          )}>
                            <Check className={cn(
                              "w-3 h-3",
                              index === 0 && "text-blue-600",
                              index === 1 && "text-purple-600",
                              index === 2 && "text-yellow-600"
                            )} />
                          </div>
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-gray-700 font-bold" : "text-gray-400"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={cn(
                      "w-full group",
                      index === 0 && "bg-blue-600 hover:bg-blue-700",
                      index === 1 && "bg-purple-600 hover:bg-purple-700",
                      index === 2 && "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    )}
                    size="lg"
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Enterprise Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include 14-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingTableThree;
    `
  };

  return variants[variant] || variants.cards;
};
