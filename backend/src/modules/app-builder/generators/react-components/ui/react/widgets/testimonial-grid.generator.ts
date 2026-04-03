import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTestimonialGrid = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'masonry' = 'threeColumn'
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

  const variants = {
    twoColumn: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, CheckCircle, Quote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialGrid({ ${dataName}: propData, className }: TestimonialGridProps) {
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

  const testimonialData = ${dataName} || {};

  const testimonials = ${getField('testimonials')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};
  const initialLoadCount = ${getField('initialLoadCount')};
  const loadMoreCount = ${getField('loadMoreCount')};
  const loadMoreButton = ${getField('loadMoreButton')};

  const [visibleCount, setVisibleCount] = useState(initialLoadCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadMoreCount, testimonials.length));
  };

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  return (
    <section className={cn('relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 overflow-hidden', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionSubheading}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {visibleTestimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-500"
            >
              {/* Gradient Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>

              <div className="relative">
                {/* Quote Icon */}
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-gradient-to-r from-yellow-400 to-orange-400 text-yellow-400 drop-shadow-sm" />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Verified</span>
                    </div>
                  )}
                </div>

                {/* Quote */}
                <p className="text-gray-900 dark:text-white text-lg mb-8 leading-relaxed font-medium">
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-sm opacity-75"></div>
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="relative w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {testimonial.title}
                    </div>
                    <div className="inline-block mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        {testimonial.company}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              className="relative px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-500"
            >
              <span className="relative z-10">{loadMoreButton}</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
    `,

    threeColumn: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, Quote, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialGrid({ ${dataName}: propData, className }: TestimonialGridProps) {
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

  const testimonialData = ${dataName} || {};

  const testimonials = ${getField('testimonials')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};
  const initialLoadCount = ${getField('initialLoadCount')};
  const loadMoreCount = ${getField('loadMoreCount')};
  const loadMoreButton = ${getField('loadMoreButton')};

  const [visibleCount, setVisibleCount] = useState(initialLoadCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadMoreCount, testimonials.length));
  };

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  return (
    <section className={cn('relative bg-gradient-to-b from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10 overflow-hidden', className)}>
      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Customer Stories
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionSubheading}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleTestimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 h-full flex flex-col"
              style={{ animationDelay: \`\${index * 100}ms\` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>

              <div className="relative flex flex-col h-full">
                {/* Quote Icon */}
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6 w-fit">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-900 dark:text-white text-base mb-6 leading-relaxed flex-grow font-medium">
                  "{testimonial.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-sm opacity-75"></div>
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="relative w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white truncate">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              className="relative px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-500"
            >
              <span className="relative z-10">{loadMoreButton}</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
    `,

    masonry: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, CheckCircle, ThumbsUp, Quote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialGrid({ ${dataName}: propData, className }: TestimonialGridProps) {
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

  const testimonialData = ${dataName} || {};

  const testimonials = ${getField('testimonials')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};
  const initialLoadCount = ${getField('initialLoadCount')};
  const loadMoreCount = ${getField('loadMoreCount')};
  const loadMoreButton = ${getField('loadMoreButton')};

  const [visibleCount, setVisibleCount] = useState(initialLoadCount);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadMoreCount, testimonials.length));
  };

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  return (
    <section className={cn('relative bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10 overflow-hidden', className)}>
      {/* Dot Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionSubheading}
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {visibleTestimonials.map((testimonial: any, index: number) => {
            const isHovered = hoveredIndex === index;
            const isFeatured = index % 5 === 0;
            return (
              <div
                key={index}
                className="break-inside-avoid"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={\`group relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-800 dark:via-blue-900/10 dark:to-purple-900/10 rounded-3xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 \${
                    isHovered ? 'scale-[1.02] -translate-y-1' : ''
                  } \${isFeatured ? 'ring-2 ring-gradient-to-r from-blue-500 to-purple-500' : ''}\`}
                >
                  {/* Gradient Glow on Hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-sm opacity-75"></div>
                          <img
                            src={testimonial.photo}
                            alt={testimonial.name}
                            className="relative w-14 h-14 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg"
                          />
                        </div>
                        <div>
                          <div className={\`font-bold text-gray-900 dark:text-white flex items-center gap-2 \${isFeatured ? 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent' : ''}\`}>
                            {testimonial.name}
                            {testimonial.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                        <Quote className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-gray-900 dark:text-white leading-relaxed mb-5 font-medium">
                      "{testimonial.quote}"
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                        {testimonial.date}
                      </div>
                      <button
                        className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 \${
                          isHovered
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                        }\`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">Helpful</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              className="relative px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-500"
            >
              <span className="relative z-10">{loadMoreButton}</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50"></div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.threeColumn;
};
