import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRatingInputNumbers = (
  resolved: ResolvedComponent,
  variant: 'buttons' | 'radio' | 'scale' = 'buttons'
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
import { ThumbsUp, Star, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    buttons: `
${commonImports}

interface RatingInputButtonsProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

const RatingInputButtons: React.FC<RatingInputButtonsProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onRatingChange }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const ratingLabel = ${getField('ratingLabel')};
  const ratingDescription = ${getField('ratingDescription')};
  const submitButton = ${getField('submitButton')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const numberLabels = ${getField('numberLabels')};
  const minScale = ${getField('minScale')};
  const maxScale = ${getField('maxScale')};
  const feedbackPlaceholder = ${getField('feedbackPlaceholder')};
  const feedbackLabel = ${getField('feedbackLabel')};

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    onRatingChange?.(rating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating) {
      console.log('Rating submitted:', { rating: selectedRating, feedback });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedRating(null);
        setFeedback('');
      }, 3000);
    }
  };

  const getButtonColor = (rating: number) => {
    const currentRating = hoveredRating || selectedRating;
    if (!currentRating) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';

    if (rating <= currentRating) {
      if (currentRating <= 3) return 'bg-gradient-to-r from-red-500 to-rose-600 text-white';
      if (currentRating <= 6) return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const getLabel = (rating: number) => {
    return numberLabels[rating] || \`Rating \${rating}\`;
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {thankYouMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your rating of {selectedRating} has been recorded.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {ratingLabel}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {ratingDescription}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Array.from({ length: maxScale - minScale + 1 }, (_, i) => i + minScale).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className={\`w-16 h-16 rounded-2xl font-bold text-xl transition-all duration-200 transform hover:scale-125 shadow-lg hover:shadow-2xl \${getButtonColor(rating)} \${
                  selectedRating === rating ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-110' : ''
                }\`}
              >
                {rating}
              </button>
            ))}
          </div>

          {(hoveredRating || selectedRating) && (
            <div className="text-center mb-6 animate-fade-in">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getLabel(hoveredRating || selectedRating!)}
              </p>
            </div>
          )}

          {selectedRating && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {feedbackLabel}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={feedbackPlaceholder}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedRating}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {submitButton}
          </button>
        </form>
      )}
    </div>
  );
};

export default RatingInputButtons;
    `,

    radio: `
${commonImports}

interface RatingInputRadioProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

const RatingInputRadio: React.FC<RatingInputRadioProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onRatingChange }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const ratingLabel = ${getField('ratingLabel')};
  const npsQuestion = ${getField('npsQuestion')};
  const submitButton = ${getField('submitButton')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const customLabels = ${getField('customLabels')};
  const minScale = ${getField('minScale')};
  const maxScale = ${getField('maxScale')};
  const npsLowLabel = ${getField('npsLowLabel')};
  const npsHighLabel = ${getField('npsHighLabel')};
  const feedbackPlaceholder = ${getField('feedbackPlaceholder')};

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    onRatingChange?.(rating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating) {
      console.log('Rating submitted:', { rating: selectedRating, feedback });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedRating(null);
        setFeedback('');
      }, 3000);
    }
  };

  const getColorForRating = (rating: number) => {
    const label = customLabels.find((l: any) => l.value === rating);
    return label?.color || '#3b82f6';
  };

  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {thankYouMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your rating of {selectedRating}/10 has been recorded.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {npsQuestion}
            </h3>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4">
              <span>{npsLowLabel}</span>
              <span>{npsHighLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-8">
            {Array.from({ length: maxScale - minScale + 1 }, (_, i) => i + minScale).map((rating) => {
              const labelData = customLabels.find((l: any) => l.value === rating);
              return (
                <label
                  key={rating}
                  className="relative cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="sr-only peer"
                  />
                  <div className={\`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all peer-checked:border-blue-500 peer-checked:shadow-lg group-hover:shadow-md \${
                    selectedRating === rating
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }\`}>
                    <span className={\`text-2xl font-bold transition-colors \${
                      selectedRating === rating
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }\`}>
                      {rating}
                    </span>
                  </div>
                  {labelData && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded">
                        {labelData.label}
                      </div>
                    </div>
                  )}
                </label>
              );
            })}
          </div>

          {selectedRating && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tell us more about your rating (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={feedbackPlaceholder}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedRating}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {submitButton}
          </button>
        </form>
      )}
    </div>
  );
};

export default RatingInputRadio;
    `,

    scale: `
${commonImports}

interface RatingInputScaleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

const RatingInputScale: React.FC<RatingInputScaleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onRatingChange }) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  const ratingLabel = ${getField('ratingLabel')};
  const ratingDescription = ${getField('ratingDescription')};
  const submitButton = ${getField('submitButton')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const numberLabels = ${getField('numberLabels')};
  const minScale = ${getField('minScale')};
  const maxScale = ${getField('maxScale')};
  const feedbackPlaceholder = ${getField('feedbackPlaceholder')};

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
    onRatingChange?.(rating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Rating submitted:', { rating: selectedRating, feedback });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedRating(5);
      setFeedback('');
    }, 3000);
  };

  const getSliderColor = () => {
    if (selectedRating <= 3) return 'bg-red-500';
    if (selectedRating <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLabel = (rating: number) => {
    return numberLabels[rating] || \`Rating \${rating}\`;
  };

  const percentage = ((selectedRating - minScale) / (maxScale - minScale)) * 100;

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {thankYouMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your rating of {selectedRating}/10 has been recorded.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {ratingLabel}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {ratingDescription}
            </p>
          </div>

          <div className="mb-12">
            <div className="relative mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>{minScale}</span>
                <span>{maxScale}</span>
              </div>

              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={\`h-full transition-all duration-200 \${getSliderColor()}\`}
                  style={{ width: \`\${percentage}%\` }}
                />
              </div>

              <input
                type="range"
                min={minScale}
                max={maxScale}
                value={selectedRating}
                onChange={(e) => handleRatingChange(parseInt(e.target.value))}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                className="absolute top-8 left-0 w-full h-3 opacity-0 cursor-pointer"
              />

              <div
                className="absolute top-5 -translate-x-1/2 pointer-events-none"
                style={{ left: \`\${percentage}%\` }}
              >
                <div className={\`w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-transform \${
                  isDragging ? 'scale-125' : 'scale-100'
                } \${getSliderColor()}\`}>
                  <span className="text-white text-sm font-bold">{selectedRating}</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className={\`inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-bold text-xl transition-all \${getSliderColor()}\`}>
                {getLabel(selectedRating)}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              {Array.from({ length: maxScale - minScale + 1 }, (_, i) => i + minScale).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleRatingChange(num)}
                  className={\`w-10 h-10 rounded-lg font-semibold transition-all \${
                    selectedRating === num
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }\`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={feedbackPlaceholder}
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {submitButton}
          </button>
        </form>
      )}
    </div>
  );
};

export default RatingInputScale;
    `
  };

  return variants[variant] || variants.buttons;
};
