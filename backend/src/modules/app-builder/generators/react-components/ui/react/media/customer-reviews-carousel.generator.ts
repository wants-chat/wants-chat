import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCustomerReviewsCarousel = (
  resolved: ResolvedComponent,
  variant: 'slider' | 'stack' | 'featured' = 'slider'
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
    return `/${dataSource || 'reviews'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'reviews';

  const variants = {
    slider: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, CheckCircle, ChevronLeft, ChevronRight, ThumbsUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerReviewsCarouselProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CustomerReviewsCarousel({ ${dataName}: propData, className }: CustomerReviewsCarouselProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const reviewData = ${dataName} || {};

  const reviews = ${getField('reviews')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};
  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(reviews.length - itemsPerView, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < reviews.length - itemsPerView;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className={cn('bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {sectionSubheading}
          </p>

          {/* Rating Summary */}
          <div className="inline-flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={\`w-6 h-6 \${
                    i < Math.floor(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }\`}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageRating}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalReviews.toLocaleString()} reviews
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: \`translateX(-\${currentIndex * (100 / itemsPerView)}%)\` }}
            >
              {reviews.map((review: any, index: number) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-3"
                  style={{ width: \`\${100 / itemsPerView}%\` }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 h-full">
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-xl">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-white text-white drop-shadow-lg hover:scale-110 transition-transform" />
                        ))}
                      </div>
                      {review.verified && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-900 dark:text-white mb-6 leading-relaxed">
                      "{review.reviewText}"
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={review.photo}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {review.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(review.reviewDate)}
                        </div>
                      </div>
                    </div>

                    {/* Helpful */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful} found this helpful</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {canGoPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
    `,

    stack: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, CheckCircle, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerReviewsCarouselProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CustomerReviewsCarousel({ ${dataName}: propData, className }: CustomerReviewsCarouselProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [visibleCount, setVisibleCount] = useState(3);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const reviewData = ${dataName} || {};

  const reviews = ${getField('reviews')};
  const sectionHeading = ${getField('sectionHeading')};
  const ratingDistribution = ${getField('ratingDistribution')};
  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, reviews.length));
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className={cn('bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left: Rating Summary */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {sectionHeading}
            </h2>

            {/* Average Rating */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                {averageRating}
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={\`w-6 h-6 \${
                      i < Math.floor(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }\`}
                  />
                ))}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Based on {totalReviews.toLocaleString()} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((dist: any) => (
                <div key={dist.stars} className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {dist.stars} star
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: \`\${dist.percentage}%\` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {dist.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Reviews Stack */}
          <div className="lg:col-span-2 space-y-6">
            {visibleReviews.map((review: any, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {review.name}
                        {review.verified && (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(review.reviewDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {review.reviewText}
                </p>
              </div>
            ))}

            {/* Show More Button */}
            {hasMore && (
              <button
                onClick={handleShowMore}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>Show More Reviews</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    featured: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, CheckCircle, Quote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerReviewsCarouselProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CustomerReviewsCarousel({ ${dataName}: propData, className }: CustomerReviewsCarouselProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const reviewData = ${dataName} || {};

  const featuredReviews = ${getField('featuredReviews')};
  const reviews = ${getField('reviews')};
  const sectionHeading = ${getField('sectionHeading')};
  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className={cn('bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {sectionHeading}
          </h2>
          <div className="inline-flex items-center gap-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {averageRating} out of 5
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              ({totalReviews.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Featured Reviews */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {featuredReviews.map((review: any, index: number) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl shadow-2xl p-8 lg:p-10 border-2 border-blue-200/50 dark:border-blue-800 relative hover:scale-[1.02] hover:shadow-3xl transition-all duration-300"
            >
              {/* Featured Badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                Featured Review
              </div>

              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-lg text-gray-900 dark:text-white mb-6 leading-relaxed">
                "{review.reviewText}"
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={review.photo}
                  alt={review.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-lg"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                    {review.name}
                    {review.verified && (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {review.title}, {review.company}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {formatDate(review.reviewDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Regular Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review: any, index: number) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              {/* Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                {review.verified && (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
              </div>

              {/* Review Text */}
              <p className="text-gray-900 dark:text-white mb-4 leading-relaxed">
                "{review.reviewText}"
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <img
                  src={review.photo}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                    {review.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(review.reviewDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.slider;
};
