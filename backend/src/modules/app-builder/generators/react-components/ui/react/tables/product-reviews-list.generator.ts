import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductReviewsList = (
  resolved: ResolvedComponent,
  variant: 'list' | 'cards' | 'detailed' = 'list'
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

  const getRatingStars = `(rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={\`full-\${i}\`} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg hover:scale-110 transition-transform" />
        ))}
        {hasHalf && <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400 drop-shadow-md hover:scale-110 transition-transform" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-5 h-5 text-gray-300 hover:scale-110 transition-transform" />
        ))}
      </>
    );
  }`;

  const formatDate = `(dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }`;

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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ThumbsUp, ThumbsDown, ShieldCheck, Image as ImageIcon, Play, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .reviews-container {
      @apply w-full;
    }

    .review-card {
      @apply bg-white rounded-lg transition-all duration-200;
    }

    .review-header {
      @apply flex items-start gap-3;
    }

    .reviewer-avatar {
      @apply rounded-full;
    }

    .review-rating {
      @apply flex items-center gap-1;
    }

    .verified-badge {
      @apply inline-flex items-center gap-1 text-xs text-green-600 font-bold;
    }

    .review-text {
      @apply text-gray-700 leading-relaxed;
    }

    .helpful-section {
      @apply flex items-center gap-3;
    }

    .helpful-button {
      @apply inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors;
    }

    .seller-reply {
      @apply bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-3;
    }

    .review-media-grid {
      @apply grid grid-cols-4 gap-2;
    }

    .review-media-item {
      @apply relative overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .review-card {
        @apply bg-gray-800;
      }
      .review-text {
        @apply text-gray-300;
      }
      .helpful-button {
        @apply text-gray-300;
      }
    }
  `;

  const variants = {
    list: `
${commonImports}

interface ProductReviewsListProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductReviewsList: React.FC<ProductReviewsListProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const reviewsData = ${dataName} || fetchedData || {};
  const reviewsList = reviewsData.reviews || ${getField('reviews')};
  const reviewsArray = Array.isArray(reviewsList) ? reviewsList : [];

  const [sortBy, setSortBy] = useState('newest');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, { helpful: boolean; notHelpful: boolean }>>({});
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());

  const sortByNewest = ${getField('sortByNewest')};
  const sortByHighestRated = ${getField('sortByHighestRated')};
  const sortByMostHelpful = ${getField('sortByMostHelpful')};
  const sortByLowestRated = ${getField('sortByLowestRated')};
  const verifiedPurchaseText = ${getField('verifiedPurchaseText')};
  const helpfulText = ${getField('helpfulText')};
  const notHelpfulText = ${getField('notHelpfulText')};
  const wasThisHelpfulText = ${getField('wasThisHelpfulText')};
  const sellerResponseText = ${getField('sellerResponseText')};
  const reviewsHeaderText = ${getField('reviewsHeaderText')};
  const showMoreText = ${getField('showMoreText')};
  const showLessText = ${getField('showLessText')};

  const getRatingStars = ${getRatingStars};
  const formatDate = ${formatDate};

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container text-center py-8">
          <p className="text-red-500">Failed to load reviews</p>
        </div>
      </div>
    );
  }

  const handleHelpful = (reviewId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: {
        helpful: !prev[reviewId]?.helpful,
        notHelpful: false
      }
    }));
    console.log('Marked as helpful:', reviewId);
  };

  const handleNotHelpful = (reviewId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: {
        helpful: false,
        notHelpful: !prev[reviewId]?.notHelpful
      }
    }));
    console.log('Marked as not helpful:', reviewId);
  };

  const toggleExpand = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const getSortedReviews = () => {
    const sorted = [...reviewsArray];
    switch (sortBy) {
      case 'highest':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'lowest':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'helpful':
        return sorted.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }
  };

  return (
    <>
<div className="reviews-container p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{reviewsHeaderText}</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{sortByNewest}</SelectItem>
              <SelectItem value="highest">{sortByHighestRated}</SelectItem>
              <SelectItem value="lowest">{sortByLowestRated}</SelectItem>
              <SelectItem value="helpful">{sortByMostHelpful}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {getSortedReviews().map((review: any) => {
            const reviewId = ${getField('id')};
            const reviewerName = ${getField('reviewerName')};
            const reviewerAvatar = ${getField('reviewerAvatar')};
            const rating = ${getField('rating')};
            const date = ${getField('date')};
            const verifiedPurchase = ${getField('verifiedPurchase')};
            const title = ${getField('title')};
            const reviewText = ${getField('reviewText')};
            const currentHelpfulVotes = ${getField('helpfulVotes')};
            const images = ${getField('images')};
            const sellerReply = ${getField('sellerReply')};
            const isExpanded = expandedReviews.has(reviewId);
            const shouldTruncate = reviewText && reviewText.length > 300;

            return (
              <Card key={reviewId} className="review-card rounded-2xl shadow-xl border border-gray-200/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="review-header mb-4">
                    <Avatar className="reviewer-avatar ring-4 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage src={reviewerAvatar || '/api/placeholder/40/40'} alt={reviewerName} />
                      <AvatarFallback>{reviewerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-base">{reviewerName}</h4>
                        <span className="text-sm text-gray-500">{formatDate(date)}</span>
                      </div>
                      <div className="review-rating mb-1">
                        {getRatingStars(rating)}
                      </div>
                      {verifiedPurchase && (
                        <div className="verified-badge bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{verifiedPurchaseText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {title && (
                    <h5 className="font-bold text-lg mb-2">{title}</h5>
                  )}

                  <p className="review-text">
                    {shouldTruncate && !isExpanded
                      ? \`\${reviewText.substring(0, 300)}...\`
                      : reviewText}
                  </p>

                  {shouldTruncate && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 mt-2"
                      onClick={() => toggleExpand(reviewId)}
                    >
                      {isExpanded ? (
                        <>
                          {showLessText} <ChevronUp className="w-4 h-4 ml-1" />
                        </>
                      ) : (
                        <>
                          {showMoreText} <ChevronDown className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}

                  {images && images.length > 0 && (
                    <div className="review-media-grid mt-4">
                      {images.map((img: string, idx: number) => (
                        <div key={idx} className="review-media-item aspect-square">
                          <img
                            src={img || '/api/placeholder/100/100'}
                            alt={\`Review image \${idx + 1}\`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="helpful-section">
                    <span className="text-sm text-gray-600">{wasThisHelpfulText}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={\`helpful-button rounded-xl hover:scale-105 transition-transform \${helpfulVotes[reviewId]?.helpful ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0' : ''}\`}
                      onClick={() => handleHelpful(reviewId)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {helpfulText} ({currentHelpfulVotes + (helpfulVotes[reviewId]?.helpful ? 1 : 0)})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={\`helpful-button rounded-xl hover:scale-105 transition-transform \${helpfulVotes[reviewId]?.notHelpful ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-0' : ''}\`}
                      onClick={() => handleNotHelpful(reviewId)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {notHelpfulText}
                    </Button>
                  </div>

                  {sellerReply && (
                    <div className="seller-reply">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {sellerResponseText}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatDate(sellerReply.date)}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{sellerReply.text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductReviewsList;
    `,

    cards: `
${commonImports}

interface ProductReviewsListProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductReviewsList: React.FC<ProductReviewsListProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const reviewsData = ${dataName} || fetchedData || {};
  const reviewsList = reviewsData.reviews || ${getField('reviews')};
  const reviewsArray = Array.isArray(reviewsList) ? reviewsList : [];

  const [sortBy, setSortBy] = useState('newest');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, { helpful: boolean; notHelpful: boolean }>>({});

  const sortByNewest = ${getField('sortByNewest')};
  const sortByHighestRated = ${getField('sortByHighestRated')};
  const sortByMostHelpful = ${getField('sortByMostHelpful')};
  const verifiedPurchaseText = ${getField('verifiedPurchaseText')};
  const helpfulText = ${getField('helpfulText')};
  const wasThisHelpfulText = ${getField('wasThisHelpfulText')};
  const reviewsHeaderText = ${getField('reviewsHeaderText')};

  const getRatingStars = ${getRatingStars};
  const formatDate = ${formatDate};

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container text-center py-8">
          <p className="text-red-500">Failed to load reviews</p>
        </div>
      </div>
    );
  }

  const handleHelpful = (reviewId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: {
        helpful: !prev[reviewId]?.helpful,
        notHelpful: false
      }
    }));
    console.log('Marked as helpful:', reviewId);
  };

  const getSortedReviews = () => {
    const sorted = [...reviewsArray];
    switch (sortBy) {
      case 'highest':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'helpful':
        return sorted.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }
  };

  return (
    <>
<div className="reviews-container p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{reviewsHeaderText}</h2>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{sortByNewest}</SelectItem>
              <SelectItem value="highest">{sortByHighestRated}</SelectItem>
              <SelectItem value="helpful">{sortByMostHelpful}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getSortedReviews().map((review: any) => {
            const reviewId = ${getField('id')};
            const reviewerName = ${getField('reviewerName')};
            const reviewerAvatar = ${getField('reviewerAvatar')};
            const rating = ${getField('rating')};
            const date = ${getField('date')};
            const verifiedPurchase = ${getField('verifiedPurchase')};
            const title = ${getField('title')};
            const reviewText = ${getField('reviewText')};
            const currentHelpfulVotes = ${getField('helpfulVotes')};
            const images = ${getField('images')};

            return (
              <Card key={reviewId} className="review-card rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="reviewer-avatar w-10 h-10 ring-4 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage src={reviewerAvatar || '/api/placeholder/40/40'} alt={reviewerName} />
                      <AvatarFallback>{reviewerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{reviewerName}</h4>
                      <span className="text-xs text-gray-500">{formatDate(date)}</span>
                    </div>
                  </div>
                  <div className="review-rating">
                    {getRatingStars(rating)}
                    {verifiedPurchase && (
                      <Badge variant="outline" className="ml-2 text-xs text-green-600 border-green-600">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {verifiedPurchaseText}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {title && (
                    <h5 className="font-bold mb-2">{title}</h5>
                  )}
                  <p className="review-text text-sm line-clamp-3 mb-3">{reviewText}</p>

                  {images && images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {images.slice(0, 3).map((img: string, idx: number) => (
                        <div key={idx} className="review-media-item w-16 h-16">
                          <img
                            src={img || '/api/placeholder/64/64'}
                            alt={\`Review image \${idx + 1}\`}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                      {images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                          +{images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{wasThisHelpfulText}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={\`h-8 px-2 \${helpfulVotes[reviewId]?.helpful ? 'text-green-600' : ''}\`}
                      onClick={() => handleHelpful(reviewId)}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {currentHelpfulVotes + (helpfulVotes[reviewId]?.helpful ? 1 : 0)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductReviewsList;
    `,

    detailed: `
${commonImports}

interface ProductReviewsListProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const ProductReviewsList: React.FC<ProductReviewsListProps> = ({ ${dataName}, className }) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const reviewsData = ${dataName} || fetchedData || {};
  const reviewsList = reviewsData.reviews || ${getField('reviews')};
  const reviewsArray = Array.isArray(reviewsList) ? reviewsList : [];

  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, { helpful: boolean; notHelpful: boolean }>>({});

  if (isLoading && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={className}>
        <div className="reviews-container text-center py-8">
          <p className="text-red-500">Failed to load reviews</p>
        </div>
      </div>
    );
  }
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const sortByNewest = ${getField('sortByNewest')};
  const sortByHighestRated = ${getField('sortByHighestRated')};
  const sortByMostHelpful = ${getField('sortByMostHelpful')};
  const sortByLowestRated = ${getField('sortByLowestRated')};
  const verifiedPurchaseText = ${getField('verifiedPurchaseText')};
  const helpfulText = ${getField('helpfulText')};
  const notHelpfulText = ${getField('notHelpfulText')};
  const wasThisHelpfulText = ${getField('wasThisHelpfulText')};
  const sellerResponseText = ${getField('sellerResponseText')};
  const reviewsHeaderText = ${getField('reviewsHeaderText')};
  const filterByRatingText = ${getField('filterByRatingText')};
  const allStarsText = ${getField('allStarsText')};

  const getRatingStars = ${getRatingStars};
  const formatDate = ${formatDate};

  const handleHelpful = (reviewId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: {
        helpful: !prev[reviewId]?.helpful,
        notHelpful: false
      }
    }));
    console.log('Marked as helpful:', reviewId);
  };

  const handleNotHelpful = (reviewId: number) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: {
        helpful: false,
        notHelpful: !prev[reviewId]?.notHelpful
      }
    }));
    console.log('Marked as not helpful:', reviewId);
  };

  const getSortedAndFilteredReviews = () => {
    let filtered = [...reviewsArray];

    // Filter by rating
    if (filterRating !== 'all') {
      const targetRating = parseInt(filterRating);
      filtered = filtered.filter(r => Math.floor(r.rating || 0) === targetRating);
    }

    // Sort
    switch (sortBy) {
      case 'highest':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'lowest':
        return filtered.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'helpful':
        return filtered.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsArray.forEach((review: any) => {
      const rating = Math.floor(review.rating || 0);
      distribution[rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const averageRating = reviewsArray.length > 0
    ? reviewsArray.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviewsArray.length
    : 0;

  const distribution = getRatingDistribution();

  return (
    <>
<div className="reviews-container p-4">
        <h2 className="text-3xl font-bold mb-6">{reviewsHeaderText}</h2>

        {/* Rating Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(averageRating)}
                </div>
                <p className="text-gray-600">{reviewsArray.length} reviews</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(stars => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-12">{stars} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: \`\${reviewsArray.length > 0 ? (distribution[stars as keyof typeof distribution] / reviewsArray.length) * 100 : 0}%\` }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right text-gray-600">
                      {distribution[stars as keyof typeof distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">{filterByRatingText}</label>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger>
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{allStarsText}</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Sort by</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{sortByNewest}</SelectItem>
                <SelectItem value="highest">{sortByHighestRated}</SelectItem>
                <SelectItem value="lowest">{sortByLowestRated}</SelectItem>
                <SelectItem value="helpful">{sortByMostHelpful}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {getSortedAndFilteredReviews().map((review: any) => {
            const reviewId = ${getField('id')};
            const reviewerName = ${getField('reviewerName')};
            const reviewerAvatar = ${getField('reviewerAvatar')};
            const rating = ${getField('rating')};
            const date = ${getField('date')};
            const verifiedPurchase = ${getField('verifiedPurchase')};
            const title = ${getField('title')};
            const reviewText = ${getField('reviewText')};
            const currentHelpfulVotes = ${getField('helpfulVotes')};
            const notHelpfulVotesCount = ${getField('notHelpfulVotes')};
            const images = ${getField('images')};
            const videos = ${getField('videos')};
            const sellerReply = ${getField('sellerReply')};

            return (
              <Card key={reviewId} className="review-card rounded-2xl shadow-xl border border-gray-200/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="review-header mb-4">
                    <Avatar className="reviewer-avatar w-12 h-12 ring-4 ring-blue-200 dark:ring-blue-800">
                      <AvatarImage src={reviewerAvatar || '/api/placeholder/48/48'} alt={reviewerName} />
                      <AvatarFallback>{reviewerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-lg">{reviewerName}</h4>
                        <span className="text-sm text-gray-500">{formatDate(date)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="review-rating">
                          {getRatingStars(rating)}
                        </div>
                        <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                      </div>
                      {verifiedPurchase && (
                        <Badge className="verified-badge bg-green-50 text-green-700 border-green-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{verifiedPurchaseText}</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {title && (
                    <h5 className="font-bold text-xl mb-3">{title}</h5>
                  )}

                  <p className="review-text mb-4">{reviewText}</p>

                  {images && images.length > 0 && (
                    <div className="review-media-grid mb-4">
                      {images.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          className="review-media-item aspect-square"
                          onClick={() => setSelectedMedia({ type: 'image', url: img })}
                        >
                          <img
                            src={img || '/api/placeholder/150/150'}
                            alt={\`Review image \${idx + 1}\`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {videos && videos.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {videos.map((video: string, idx: number) => (
                        <div
                          key={idx}
                          className="review-media-item w-32 h-32 bg-gray-200"
                          onClick={() => setSelectedMedia({ type: 'video', url: video })}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-gray-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="helpful-section">
                    <span className="text-sm font-medium text-gray-700">{wasThisHelpfulText}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className={\`helpful-button \${helpfulVotes[reviewId]?.helpful ? 'bg-green-50 text-green-700 border-green-300' : ''}\`}
                      onClick={() => handleHelpful(reviewId)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {helpfulText} ({currentHelpfulVotes + (helpfulVotes[reviewId]?.helpful ? 1 : 0)})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={\`helpful-button \${helpfulVotes[reviewId]?.notHelpful ? 'bg-red-50 text-red-700 border-red-300' : ''}\`}
                      onClick={() => handleNotHelpful(reviewId)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {notHelpfulText} ({notHelpfulVotesCount + (helpfulVotes[reviewId]?.notHelpful ? 1 : 0)})
                    </Button>
                  </div>

                  {sellerReply && (
                    <div className="seller-reply">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600 text-white">
                          {sellerResponseText}
                        </Badge>
                        <span className="text-sm text-gray-600">{formatDate(sellerReply.date)}</span>
                      </div>
                      <p className="text-gray-700">{sellerReply.text}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductReviewsList;
    `
  };

  return variants[variant] || variants.list;
};
