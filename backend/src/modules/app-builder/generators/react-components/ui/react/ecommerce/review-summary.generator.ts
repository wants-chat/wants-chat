import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Common mock data for review summary

export const generateReviewSummary = (
  resolved: ResolvedComponent,
  variant: 'overview' | 'detailed' | 'compact' = 'overview'
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
  const entity = dataSource?.split('.').pop() || 'reviews';

  const variants = {
    overview: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, StarHalf, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  ${dataName}?: any;
  className?: string;
  onWriteReview?: () => void;
}

export default function ReviewSummary({ ${dataName}: propData, className, onWriteReview }: ReviewSummaryProps) {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};
  const ratingDistribution = ${getField('ratingDistribution')};
  const recentReviews = ${getField('recentReviews')};
  const filterOptions = ${getField('filterOptions')};
  const sortOptions = ${getField('sortOptions')};
  const reviewSummaryTitle = ${getField('reviewSummaryTitle')};
  const averageRatingLabel = ${getField('averageRatingLabel')};
  const totalReviewsLabel = ${getField('totalReviewsLabel')};
  const ratingDistributionLabel = ${getField('ratingDistributionLabel')};
  const filterByLabel = ${getField('filterByLabel')};
  const sortByLabel = ${getField('sortByLabel')};
  const verifiedPurchaseLabel = ${getField('verifiedPurchaseLabel')};
  const helpfulLabel = ${getField('helpfulLabel')};
  const writeReviewButton = ${getField('writeReviewButton')};
  const showMoreButton = ${getField('showMoreButton')};
  const outOfLabel = ${getField('outOfLabel')};
  const starsLabel = ${getField('starsLabel')};

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={\`empty-\${i}\`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />);
    }

    return stars;
  };

  const handleWriteReview = () => {
    console.log('Write review');
    if (onWriteReview) onWriteReview();
    else alert('Opening review form...');
  };

  const handleShowMore = () => {
    console.log('Show more reviews');
    alert('Loading more reviews...');
  };

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{reviewSummaryTitle}</h2>
          </div>
          <button onClick={handleWriteReview} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            {writeReviewButton}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Rating Overview */}
          <Card className="rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-purple-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-10"></div>
            <CardContent className="p-8 text-center relative z-10">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 drop-shadow-lg">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-3 gap-1">
                {renderStars(averageRating)}
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-bold">
                {totalReviews.toLocaleString()} {totalReviewsLabel.toLowerCase()}
              </p>
            </CardContent>
          </Card>

          {/* Rating Distribution */}
          <Card className="lg:col-span-2 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 dark:bg-gray-800 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <h3 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{ratingDistributionLabel}</h3>
              </div>
              <div className="space-y-4">
                {ratingDistribution.map((item: any) => (
                  <div key={item.stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.stars}</span>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full shadow-md transition-all duration-500"
                        style={{ width: \`\${item.percentage}%\` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-16 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {filterByLabel}
            </label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {filterOptions.map((option: any) => (
                  <SelectItem key={option.value} value={option.value} className="dark:text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {sortByLabel}
            </label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {sortOptions.map((option: any) => (
                  <SelectItem key={option.value} value={option.value} className="dark:text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {recentReviews.map((review: any) => (
            <Card key={review.id} className="rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 dark:bg-gray-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      {review.verified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-full text-xs shadow-sm">
                          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{verifiedPurchaseLabel}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{review.title}</h4>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{review.date}</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    By {review.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {review.helpful} {helpfulLabel}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More */}
        <div className="text-center mt-8">
          <button onClick={handleShowMore} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            {showMoreButton}
          </button>
        </div>
      </div>
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, StarHalf, Check, ThumbsUp, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  ${dataName}?: any;
  className?: string;
  onWriteReview?: () => void;
}

export default function ReviewSummary({ ${dataName}: propData, className, onWriteReview }: ReviewSummaryProps) {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};
  const ratingDistribution = ${getField('ratingDistribution')};
  const recentReviews = ${getField('recentReviews')};
  const filterOptions = ${getField('filterOptions')};
  const sortOptions = ${getField('sortOptions')};
  const reviewSummaryTitle = ${getField('reviewSummaryTitle')};
  const ratingDistributionLabel = ${getField('ratingDistributionLabel')};
  const filterByLabel = ${getField('filterByLabel')};
  const sortByLabel = ${getField('sortByLabel')};
  const verifiedPurchaseLabel = ${getField('verifiedPurchaseLabel')};
  const helpfulLabel = ${getField('helpfulLabel')};
  const writeReviewButton = ${getField('writeReviewButton')};
  const showMoreButton = ${getField('showMoreButton')};
  const outOfLabel = ${getField('outOfLabel')};

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={\`empty-\${i}\`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />);
    }

    return stars;
  };

  const handleWriteReview = () => {
    console.log('Write review');
    if (onWriteReview) onWriteReview();
    else alert('Opening review form...');
  };

  const handleMarkHelpful = (reviewId: string) => {
    console.log('Mark helpful:', reviewId);
    alert('Marked as helpful!');
  };

  const handleReportReview = (reviewId: string) => {
    console.log('Report review:', reviewId);
    alert('Review reported');
  };

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{reviewSummaryTitle}</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {averageRating.toFixed(1)} {outOfLabel} • {totalReviews.toLocaleString()} reviews
            </p>
          </div>
          <button onClick={handleWriteReview} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            {writeReviewButton}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Rating Overview */}
            <Card className="rounded-xl shadow-lg border-2 border-blue-200 dark:border-purple-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-10"></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(averageRating)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalReviews.toLocaleString()} reviews
                </p>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 dark:bg-gray-800 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{ratingDistributionLabel}</h3>
                </div>
                <div className="space-y-3">
                  {ratingDistribution.map((item: any) => (
                    <button
                      key={item.stars}
                      onClick={() => setFilter(String(item.stars))}
                      className="w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-2 transition-colors"
                    >
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.stars}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: \`\${item.percentage}%\` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="verified"
                    checked={verifiedOnly}
                    onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                    className="dark:border-gray-600"
                  />
                  <label htmlFor="verified" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    {verifiedPurchaseLabel} only
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews */}
          <div className="lg:col-span-3">
            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {sortByLabel}
              </label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-64 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {sortOptions.map((option: any) => (
                    <SelectItem key={option.value} value={option.value} className="dark:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {recentReviews.map((review: any) => (
                <Card key={review.id} className="rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          {review.verified && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                              <Check className="w-3 h-3" />
                              <span>{verifiedPurchaseLabel}</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{review.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">By {review.author} • {review.date}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">{review.content}</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleMarkHelpful(review.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-600 hover:text-green-600 dark:hover:text-green-400 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful ({review.helpful})</span>
                      </button>
                      <button
                        onClick={() => handleReportReview(review.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More */}
            <div className="text-center mt-8">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                {showMoreButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    compact: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ReviewSummary({ ${dataName}: propData, className }: ReviewSummaryProps) {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  const averageRating = ${getField('averageRating')};
  const totalReviews = ${getField('totalReviews')};

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < fullStars
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          )}
        />
      );
    }

    return stars;
  };

  return (
    <div className={cn("flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-purple-700 rounded-full shadow-md", className)}>
      <div className="flex gap-0.5">{renderStars(averageRating)}</div>
      <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {averageRating.toFixed(1)}
      </span>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        ({totalReviews.toLocaleString()})
      </span>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.overview;
};
