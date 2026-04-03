import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRatingInputStars = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'half' | 'interactive' = 'basic'
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

  const dataName = dataSource.split('.').pop() || 'data';

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
import { Star, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface RatingInputStarsProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (rating: number) => void;
}

const RatingInputStarsComponent: React.FC<RatingInputStarsProps> = ({
  ${dataName},
  className,
  onChange
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

  const ratingData = propData || fetchedData || {};

  const maxStars = ${getField('maxStars')};
  const [rating, setRating] = useState(${getField('defaultRating')});
  const [hoverRating, setHoverRating] = useState(0);

  const label = ${getField('label')};

  const handleClick = (value: number) => {
    setRating(value);
    if (onChange) {
      onChange(value);
    }
    console.log('Rating:', value);
  };

  return (
    <div className={cn("w-full max-w-md mx-auto p-6", className)}>
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200/50">
        <label className="block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          {label}
        </label>

        <div className="flex justify-center items-center gap-3 mb-6">
          {[...Array(maxStars)].map((_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= (hoverRating || rating);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleClick(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-125 active:scale-95"
              >
                <Star
                  className={cn(
                    "w-12 h-12 transition-all duration-200",
                    isFilled
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                      : "fill-none text-gray-300 dark:text-gray-600"
                  )}
                />
              </button>
            );
          })}
        </div>

        {rating > 0 && (
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {rating} / {maxStars}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingInputStarsComponent;
    `,

    half: `
${commonImports}

interface RatingInputStarsProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (rating: number) => void;
}

const RatingInputStarsComponent: React.FC<RatingInputStarsProps> = ({
  ${dataName},
  className,
  onChange
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

  const ratingData = propData || fetchedData || {};

  const maxStars = ${getField('maxStars')};
  const [rating, setRating] = useState(${getField('initialRating')});
  const [hoverRating, setHoverRating] = useState(0);

  const label = ${getField('label')};
  const ratingText = ${getField('ratingText')};

  const handleClick = (value: number) => {
    setRating(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleMouseMove = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return '';
    const index = Math.ceil(rating) - 1;
    return ratingText[index] || '';
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto p-6", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md p-6">
        <div className="text-center">
          <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {label}
          </label>

          <div className="flex justify-center items-center gap-1 mb-6">
            {[...Array(maxStars)].map((_, index) => {
              const starValue = index + 1;
              const currentRating = hoverRating || rating;
              const isFull = starValue <= currentRating;
              const isHalf = starValue - 0.5 === currentRating;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const isHalfClick = x < rect.width / 2;
                    handleClick(index + (isHalfClick ? 0.5 : 1));
                  }}
                  onMouseMove={(e) => handleMouseMove(index, e)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="relative transition-transform hover:scale-110"
                >
                  {isHalf ? (
                    <div className="relative w-12 h-12">
                      <Star className="absolute inset-0 w-12 h-12 fill-none text-gray-300 dark:text-gray-600" />
                      <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                        <Star className="w-12 h-12 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  ) : (
                    <Star
                      className={cn(
                        "w-12 h-12 transition-colors",
                        isFull
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-gray-300 dark:text-gray-600"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {(rating > 0 || hoverRating > 0) && (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {(hoverRating || rating).toFixed(1)} / {maxStars}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {getRatingText(hoverRating || rating)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingInputStarsComponent;
    `,

    interactive: `
${commonImports}

interface RatingInputStarsProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (rating: number, feedback?: string) => void;
}

const RatingInputStarsComponent: React.FC<RatingInputStarsProps> = ({
  ${dataName},
  className,
  onChange
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

  const ratingData = propData || fetchedData || {};

  const maxStars = ${getField('maxStars')};
  const [rating, setRating] = useState(${getField('defaultRating')});
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const label = ${getField('label')};
  const ratingText = ${getField('ratingText')};
  const submitLabel = ${getField('submitLabel')};

  const handleClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      if (onChange) {
        onChange(rating, feedback);
      }
      console.log('Submitted:', { rating, feedback });
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFeedback('');
      }, 3000);
    }
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return '';
    return ratingText[rating - 1] || '';
  };

  if (submitted) {
    return (
      <div className={cn("w-full max-w-lg mx-auto p-6", className)}>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            Thank You!
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Your rating has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-lg mx-auto p-6", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-8">
        <div className="text-center mb-6">
          <label className="block text-xl font-bold text-gray-900 dark:text-white mb-6">
            {label}
          </label>

          <div className="flex justify-center items-center gap-2 mb-4">
            {[...Array(maxStars)].map((_, index) => {
              const starValue = index + 1;
              const isFilled = starValue <= (hoverRating || rating);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleClick(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-125"
                >
                  <Star
                    className={cn(
                      "w-14 h-14 transition-all",
                      isFilled
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-lg"
                        : "fill-none text-gray-300 dark:text-gray-600"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {(rating > 0 || hoverRating > 0) && (
            <div className="mb-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {hoverRating || rating} / {maxStars}
              </div>
              <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {getRatingText(hoverRating || rating)}
              </div>
            </div>
          )}
        </div>

        {rating > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tell us more (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {submitLabel}
            </Button>
          </div>
        )}

        {rating === 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Click on a star to rate
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingInputStarsComponent;
    `
  };

  return variants[variant] || variants.basic;
};
