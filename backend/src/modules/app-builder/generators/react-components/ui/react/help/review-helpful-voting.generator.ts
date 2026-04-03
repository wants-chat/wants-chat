import { ResolvedComponent } from '../../../types/resolved-component.interface';

// Common mock data for review helpful voting

export const generateReviewHelpfulVoting = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'social' = 'simple'
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
    simple: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewHelpfulVotingProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (vote: 'helpful' | 'notHelpful') => void;
}

export default function ReviewHelpfulVoting({ ${dataName}: propData, className, onVote }: ReviewHelpfulVotingProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [helpfulCount, setHelpfulCount] = useState(${getField('helpfulCount')});
  const [notHelpfulCount, setNotHelpfulCount] = useState(${getField('notHelpfulCount')});
  const [userVote, setUserVote] = useState<string | null>(${getField('userVote')});
  const [showThanks, setShowThanks] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const wasThisHelpfulLabel = ${getField('wasThisHelpfulLabel')};
  const helpfulLabel = ${getField('helpfulLabel')};
  const notHelpfulLabel = ${getField('notHelpfulLabel')};
  const thankYouMessage = ${getField('thankYouMessage')};

  const handleVote = (vote: 'helpful' | 'notHelpful') => {
    if (userVote) {
      alert('You have already voted on this review');
      return;
    }

    console.log('Vote:', vote);

    if (vote === 'helpful') {
      setHelpfulCount(prev => prev + 1);
    } else {
      setNotHelpfulCount(prev => prev + 1);
    }

    setUserVote(vote);
    setShowThanks(true);

    if (onVote) {
      onVote(vote);
    }

    setTimeout(() => setShowThanks(false), 3000);
  };

  return (
    <div className={cn("", className)}>
      {showThanks ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{thankYouMessage}</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-purple-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{wasThisHelpfulLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleVote('helpful')}
              disabled={!!userVote}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2",
                userVote === 'helpful'
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-xl"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              {helpfulLabel} ({helpfulCount})
            </button>
            <button
              onClick={() => handleVote('notHelpful')}
              disabled={!!userVote}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2",
                userVote === 'notHelpful'
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-xl"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              {notHelpfulLabel} ({notHelpfulCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Check, Flag, Star, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewHelpfulVotingProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (vote: 'helpful' | 'notHelpful') => void;
  onReport?: () => void;
}

export default function ReviewHelpfulVoting({ ${dataName}: propData, className, onVote, onReport }: ReviewHelpfulVotingProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [helpfulCount, setHelpfulCount] = useState(${getField('helpfulCount')});
  const [notHelpfulCount, setNotHelpfulCount] = useState(${getField('notHelpfulCount')});
  const [userVote, setUserVote] = useState<string | null>(${getField('userVote')});
  const [showThanks, setShowThanks] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const review = ${getField('review')};
  const wasThisHelpfulLabel = ${getField('wasThisHelpfulLabel')};
  const helpfulLabel = ${getField('helpfulLabel')};
  const notHelpfulLabel = ${getField('notHelpfulLabel')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const reportReviewLabel = ${getField('reportReviewLabel')};
  const reportedLabel = ${getField('reportedLabel')};
  const peopleFoundHelpfulLabel = ${getField('peopleFoundHelpfulLabel')};
  const helpfulPercentage = ${getField('helpfulPercentage')};

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
        )}
      />
    ));
  };

  const handleVote = (vote: 'helpful' | 'notHelpful') => {
    if (userVote) {
      alert('You have already voted on this review');
      return;
    }

    console.log('Vote:', vote);

    if (vote === 'helpful') {
      setHelpfulCount(prev => prev + 1);
    } else {
      setNotHelpfulCount(prev => prev + 1);
    }

    setUserVote(vote);
    setShowThanks(true);

    if (onVote) {
      onVote(vote);
    }

    setTimeout(() => setShowThanks(false), 3000);
  };

  const handleReport = () => {
    console.log('Report review');
    setHasReported(true);

    if (onReport) {
      onReport();
    }

    alert('Review reported successfully');
  };

  return (
    <Card className={cn("rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 relative overflow-hidden group", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
      <CardContent className="p-6 relative z-10">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(review.rating)}</div>
              {review.verified && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{review.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">By {review.author} • {review.date}</p>
          </div>
        </div>

        {/* Review Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-6">{review.content}</p>

        {/* Voting Stats */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{helpfulCount} {peopleFoundHelpfulLabel}</span>
            </div>
            <span>•</span>
            <span>{helpfulPercentage}% found this helpful</span>
          </div>
        </div>

        {/* Actions */}
        {showThanks ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{thankYouMessage}</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-purple-400" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{wasThisHelpfulLabel}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote('helpful')}
                  disabled={!!userVote}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2",
                    userVote === 'helpful'
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-xl"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {helpfulLabel} ({helpfulCount})
                </button>
                <button
                  onClick={() => handleVote('notHelpful')}
                  disabled={!!userVote}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2",
                    userVote === 'notHelpful'
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-xl"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {notHelpfulLabel} ({notHelpfulCount})
                </button>
              </div>

              <button
                onClick={handleReport}
                disabled={hasReported}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2",
                  hasReported
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent"
                    : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                )}
              >
                <Flag className="w-4 h-4" />
                {hasReported ? reportedLabel : reportReviewLabel}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
    `,

    social: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Check, Flag, Share2, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewHelpfulVotingProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (vote: 'helpful' | 'notHelpful') => void;
  onReport?: () => void;
  onShare?: () => void;
}

export default function ReviewHelpfulVoting({ ${dataName}: propData, className, onVote, onReport, onShare }: ReviewHelpfulVotingProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [helpfulCount, setHelpfulCount] = useState(${getField('helpfulCount')});
  const [notHelpfulCount, setNotHelpfulCount] = useState(${getField('notHelpfulCount')});
  const [userVote, setUserVote] = useState<string | null>(${getField('userVote')});
  const [showThanks, setShowThanks] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const review = ${getField('review')};
  const wasThisHelpfulLabel = ${getField('wasThisHelpfulLabel')};
  const helpfulLabel = ${getField('helpfulLabel')};
  const notHelpfulLabel = ${getField('notHelpfulLabel')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const reportReviewLabel = ${getField('reportReviewLabel')};
  const reportedLabel = ${getField('reportedLabel')};

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
        )}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleVote = (vote: 'helpful' | 'notHelpful') => {
    if (userVote) {
      alert('You have already voted on this review');
      return;
    }

    console.log('Vote:', vote);

    if (vote === 'helpful') {
      setHelpfulCount(prev => prev + 1);
    } else {
      setNotHelpfulCount(prev => prev + 1);
    }

    setUserVote(vote);
    setShowThanks(true);

    if (onVote) {
      onVote(vote);
    }

    setTimeout(() => setShowThanks(false), 3000);
  };

  const handleReport = () => {
    console.log('Report review');
    setHasReported(true);

    if (onReport) {
      onReport();
    }

    alert('Review reported successfully');
  };

  const handleShare = () => {
    console.log('Share review');

    if (onShare) {
      onShare();
    }

    alert('Share review: Copy link or share on social media');
  };

  return (
    <Card className={cn("rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 dark:bg-gray-800 relative overflow-hidden group", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"></div>
      <CardContent className="p-6 relative z-10">
        {/* Review Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12 border-2 border-blue-300 dark:border-purple-600 shadow-md">
            <AvatarImage src={\`https://i.pravatar.cc/150?u=\${review.author}\`} alt={review.author} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold">
              {getInitials(review.author)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{review.author}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  {review.verified && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{review.date}</span>
            </div>

            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{review.title}</h5>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.content}</p>
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {showThanks ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-full shadow-md">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">{thankYouMessage}</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleVote('helpful')}
                  disabled={!!userVote}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg border-2",
                    userVote === 'helpful'
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-xl"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <ThumbsUp className={cn("w-4 h-4", userVote === 'helpful' && "fill-current")} />
                  <span className="text-sm font-bold">{helpfulCount}</span>
                </button>

                <button
                  onClick={() => handleVote('notHelpful')}
                  disabled={!!userVote}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg border-2",
                    userVote === 'notHelpful'
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-xl"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <ThumbsDown className={cn("w-4 h-4", userVote === 'notHelpful' && "fill-current")} />
                  <span className="text-sm font-bold">{notHelpfulCount}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-purple-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-blue-300 dark:hover:border-purple-600"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleReport}
              disabled={hasReported}
              className={cn(
                "p-2 rounded-full transition-all duration-300 hover:scale-110 border-2",
                hasReported
                  ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-md"
                  : "border-transparent hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              )}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
