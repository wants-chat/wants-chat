import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFeatureShowcaseAlternating = (
  resolved: ResolvedComponent,
  variant: 'imageLeft' | 'imageRight' | 'alternating' = 'alternating'
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
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    imageLeft: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  points?: string[];
}

interface FeatureShowcaseAlternatingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FeatureShowcaseAlternating: React.FC<FeatureShowcaseAlternatingProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const featureData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const features = ${getField('features')};

  return (
    <section className={cn("min-h-screen bg-white py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Features - Image Always on Left */}
        <div className="space-y-24">
          {features.map((feature: Feature) => (
            <div
              key={feature.id}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Image - Always on Left */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                />
              </div>

              {/* Content - Always on Right */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {feature.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {feature.points && feature.points.length > 0 && (
                  <ul className="space-y-3">
                    {feature.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {feature.ctaText && (
                  <Button className="bg-blue-600 hover:bg-blue-700 group" size="lg">
                    {feature.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcaseAlternating;
    `,

    imageRight: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  points?: string[];
}

interface FeatureShowcaseAlternatingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FeatureShowcaseAlternating: React.FC<FeatureShowcaseAlternatingProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const featureData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const features = ${getField('features')};

  return (
    <section className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Features - Image Always on Right */}
        <div className="space-y-24">
          {features.map((feature: Feature) => (
            <div
              key={feature.id}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Content - Always on Left */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {feature.title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {feature.points && feature.points.length > 0 && (
                  <ul className="space-y-3">
                    {feature.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {feature.ctaText && (
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group" size="lg">
                    {feature.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>

              {/* Image - Always on Right */}
              <div className="lg:order-last order-first relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcaseAlternating;
    `,

    alternating: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  points?: string[];
}

interface FeatureShowcaseAlternatingProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FeatureShowcaseAlternating: React.FC<FeatureShowcaseAlternatingProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const featureData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const badge = ${getField('badge')};
  const features = ${getField('features')};

  return (
    <section className={cn("min-h-screen bg-gray-50 py-16 sm:py-20 md:py-24", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-600">
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Features - Alternating Layout */}
        <div className="space-y-32">
          {features.map((feature: Feature, index: number) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={feature.id}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Image */}
                <div
                  className={cn(
                    "relative group",
                    !isEven && "lg:order-last"
                  )}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

                  {/* Image with Overlay */}
                  <div className="relative">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  </div>

                  {/* Decorative Element */}
                  <div className={cn(
                    "absolute -z-10 w-72 h-72 rounded-full blur-3xl opacity-30",
                    isEven
                      ? "-right-20 -bottom-20 bg-blue-400"
                      : "-left-20 -top-20 bg-purple-400"
                  )}></div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div className={cn(
                    "inline-block px-4 py-1 rounded-full text-sm font-semibold",
                    isEven
                      ? "bg-blue-100 text-blue-600"
                      : "bg-purple-100 text-purple-600"
                  )}>
                    Feature {index + 1}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h2>

                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {feature.points && feature.points.length > 0 && (
                    <ul className="space-y-4">
                      {feature.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            isEven ? "bg-blue-100" : "bg-purple-100"
                          )}>
                            <Check className={cn(
                              "w-4 h-4",
                              isEven ? "text-blue-600" : "text-purple-600"
                            )} />
                          </div>
                          <span className="text-gray-700 font-medium">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {feature.ctaText && (
                    <div className="pt-2">
                      <Button
                        className={cn(
                          "group",
                          isEven
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-purple-600 hover:bg-purple-700"
                        )}
                        size="lg"
                      >
                        {feature.ctaText}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcaseAlternating;
    `
  };

  return variants[variant] || variants.alternating;
};
