import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCommentSection = (
  resolved: ResolvedComponent,
  variant: 'flat' | 'review' | 'social' | 'threaded' = 'flat'
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
    return `/${dataSource || 'comments'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'comments';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    flat: `
${commonImports}
import { ThumbsUp, ThumbsDown, Flag, Share2 } from 'lucide-react';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
}

interface FlatCommentsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FlatComments: React.FC<FlatCommentsProps> = ({ ${dataName}: propData, className }) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [dislikedComments, setDislikedComments] = useState<number[]>([]);
  const [newComment, setNewComment] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const commentData = commentsData || {};

  const title = commentsData?.flatTitle || 'Comments';
  const subtitle = commentsData?.flatSubtitle || 'Join the discussion';
  const initialComments = Array.isArray(commentsData) ? commentsData : (commentsData?.flatComments || []);
  const commentsCountLabel = commentsData?.commentsCountLabel || 'Comments';
  const commentPlaceholder = commentsData?.commentPlaceholder || 'Write your comment...';
  const postCommentButton = commentsData?.postCommentButton || 'Post Comment';
  const shareButton = commentsData?.shareButton || 'Share';
  const reportButton = commentsData?.reportButton || 'Report';

  const [comments, setComments] = useState<Comment[]>([]);

  React.useEffect(() => {
    if (Array.isArray(initialComments)) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const toggleLike = (id: number) => {
    console.log(\`Like toggled for comment: \${id}\`);
    setLikedComments(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
    setDislikedComments(prev => prev.filter(cid => cid !== id));
  };

  const toggleDislike = (id: number) => {
    console.log(\`Dislike toggled for comment: \${id}\`);
    setDislikedComments(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
    setLikedComments(prev => prev.filter(cid => cid !== id));
  };

  const handleShare = (id: number) => {
    console.log(\`Share clicked for comment: \${id}\`);
  };

  const handleReport = (id: number) => {
    console.log(\`Report clicked for comment: \${id}\`);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        verified: false
      },
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      dislikes: 0
    };

    console.log('New comment posted:', comment);
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {comments.length} {commentsCountLabel}
          </h3>
        </div>

        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-4 p-5 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:shadow-xl transition-all duration-300">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-800"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {comment.author.name}
                  </span>
                  {comment.author.verified && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Verified</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {comment.timestamp}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {comment.content}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 \${
                      likedComments.includes(comment.id)
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600'
                    }\`}
                  >
                    <ThumbsUp className={\`h-4 w-4 \${likedComments.includes(comment.id) ? 'fill-white' : ''}\`} />
                    <span className={\`\${likedComments.includes(comment.id) ? 'font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text' : ''}\`}>
                      {comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleDislike(comment.id)}
                    className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 \${
                      dislikedComments.includes(comment.id)
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                    }\`}
                  >
                    <ThumbsDown className={\`h-4 w-4 \${dislikedComments.includes(comment.id) ? 'fill-white' : ''}\`} />
                    <span>
                      {comment.dislikes + (dislikedComments.includes(comment.id) ? 1 : 0)}
                    </span>
                  </button>
                  <button onClick={() => handleShare(comment.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-300">
                    <Share2 className="h-4 w-4" />
                    <span>{shareButton}</span>
                  </button>
                  <button onClick={() => handleReport(comment.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 transition-all duration-300 ml-auto">
                    <Flag className="h-4 w-4" />
                    <span>{reportButton}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FlatComments;
    `,

    review: `
${commonImports}
import { Star, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    purchasedOn?: string;
  };
  rating: number;
  title: string;
  content: string;
  timestamp: string;
  helpful: number;
  notHelpful: number;
  images?: string[];
}

interface ReviewCommentsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ReviewComments: React.FC<ReviewCommentsProps> = ({ ${dataName}: propData, className }) => {
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);
  const [notHelpfulReviews, setNotHelpfulReviews] = useState<number[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, title: '', content: '' });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
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

  const commentData = ${dataName} || {};

  const title = ${getField('reviewTitle')};
  const subtitle = ${getField('reviewSubtitle')};
  const initialReviews = ${getField('reviewComments')};
  const customerReviewsLabel = ${getField('customerReviewsLabel')};
  const writeReviewButton = ${getField('writeReviewButton')};
  const cancelButton = ${getField('cancelButton')};
  const submitReviewButton = ${getField('submitReviewButton')};
  const writeReviewFormTitle = ${getField('writeReviewFormTitle')};
  const ratingLabel = ${getField('ratingLabel')};
  const reviewTitleLabel = ${getField('reviewTitleLabel')};
  const reviewTitlePlaceholder = ${getField('reviewTitlePlaceholder')};
  const reviewContentLabel = ${getField('reviewContentLabel')};
  const reviewContentPlaceholder = ${getField('reviewContentPlaceholder')};
  const verifiedPurchaseLabel = ${getField('verifiedPurchaseLabel')};
  const purchasedOnLabel = ${getField('purchasedOnLabel')};
  const wasHelpfulLabel = ${getField('wasHelpfulLabel')};
  const yesButton = ${getField('yesButton')};
  const noButton = ${getField('noButton')};
  const ratingDistributionLabel = ${getField('ratingDistributionLabel')};
  const reviewsLabel = ${getField('reviewsLabel')};
  const starLabel = ${getField('starLabel')};

  const [reviews, setReviews] = useState<Review[]>([]);

  React.useEffect(() => {
    if (Array.isArray(initialReviews)) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  const toggleHelpful = (id: number) => {
    console.log(\`Helpful clicked for review: \${id}\`);
    setHelpfulReviews(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    setNotHelpfulReviews(prev => prev.filter(rid => rid !== id));
  };

  const toggleNotHelpful = (id: number) => {
    console.log(\`Not helpful clicked for review: \${id}\`);
    setNotHelpfulReviews(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
    setHelpfulReviews(prev => prev.filter(rid => rid !== id));
  };

  const handleToggleForm = () => {
    console.log('Toggle review form');
    setShowReviewForm(!showReviewForm);
  };

  const handleRatingClick = (rating: number) => {
    console.log(\`Rating selected: \${rating}\`);
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = () => {
    if (!newReview.title.trim() || !newReview.content.trim() || newReview.rating === 0) {
      alert('Please fill in all fields and select a rating');
      return;
    }

    const review: Review = {
      id: Date.now(),
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        verified: true,
        purchasedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      },
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      timestamp: 'Just now',
      helpful: 0,
      notHelpful: 0
    };

    console.log('Review submitted:', review);
    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 0, title: '', content: '' });
    setShowReviewForm(false);
  };

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={\`h-4 w-4 \${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {customerReviewsLabel}
          </h3>
          <button
            onClick={handleToggleForm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {showReviewForm ? cancelButton : writeReviewButton}
          </button>
        </div>

        {showReviewForm && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{writeReviewFormTitle}</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {ratingLabel} *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingClick(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={\`h-8 w-8 \${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {reviewTitleLabel} *
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder={reviewTitlePlaceholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {reviewContentLabel} *
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                placeholder={reviewContentPlaceholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            </div>

            <button
              onClick={handleSubmitReview}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {submitReviewButton}
            </button>
          </div>
        )}

        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {reviews.length} {reviewsLabel}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {ratingDistributionLabel}
              </h3>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {stars} {starLabel}
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: \`\${percentage}%\` }} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex gap-4">
                <img src={review.author.avatar} alt={review.author.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{review.author.name}</span>
                        {review.author.verified && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-medium">{verifiedPurchaseLabel}</span>
                          </div>
                        )}
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{review.timestamp}</span>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{review.title}</h4>

                  {review.author.purchasedOn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {purchasedOnLabel} {review.author.purchasedOn}
                    </p>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{review.content}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt={\`Review \${idx + 1}\`} className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{wasHelpfulLabel}</span>
                    <button
                      onClick={() => toggleHelpful(review.id)}
                      className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${
                        helpfulReviews.includes(review.id) ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }\`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{yesButton} ({review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)})</span>
                    </button>
                    <button
                      onClick={() => toggleNotHelpful(review.id)}
                      className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${
                        notHelpfulReviews.includes(review.id) ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }\`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>{noButton} ({review.notHelpful + (notHelpfulReviews.includes(review.id) ? 1 : 0)})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ReviewComments;
    `,

    social: `
${commonImports}
import { Heart, MessageCircle, Bookmark, Send } from 'lucide-react';

interface Reaction {
  emoji: string;
  label: string;
  count: number;
}

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  reactions: Reaction[];
  image?: string;
}

interface SocialCommentsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SocialComments: React.FC<SocialCommentsProps> = ({ ${dataName}: propData, className }) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [savedComments, setSavedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const commentData = commentsData || {};

  const title = commentsData?.socialTitle || '';
  const subtitle = commentsData?.socialSubtitle || '';
  const initialComments = commentsData?.socialComments || [];
  const communityFeedLabel = commentsData?.communityFeedLabel || '';
  const communityDescription = commentsData?.communityDescription || '';
  const shareButton = commentsData?.shareButton || '';
  const postReplyButton = commentsData?.postReplyButton || '';
  const cancelButton = commentsData?.cancelButton || '';
  const replyPlaceholder = commentsData?.replyPlaceholder || '';

  const [comments, setComments] = useState<Comment[]>([]);

  React.useEffect(() => {
    if (Array.isArray(initialComments)) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const toggleLike = (id: number) => {
    console.log(\`Like toggled for comment: \${id}\`);
    setLikedComments(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const toggleSave = (id: number) => {
    console.log(\`Save toggled for comment: \${id}\`);
    setSavedComments(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const handleReplyClick = (id: number) => {
    console.log(\`Reply clicked for comment: \${id}\`);
    setReplyingTo(id);
    setReplyText('');
  };

  const handleCancelReply = () => {
    console.log('Reply cancelled');
    setReplyingTo(null);
    setReplyText('');
  };

  const handleShare = (id: number) => {
    console.log(\`Share clicked for comment: \${id}\`);
  };

  const handleReaction = (commentId: number, emoji: string) => {
    console.log(\`Reaction clicked: \${emoji} for comment: \${commentId}\`);
  };

  const handleSubmitReply = (commentId: number) => {
    if (!replyText.trim()) return;

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies: comment.replies + 1 };
      }
      return comment;
    }));

    console.log(\`Reply posted to comment \${commentId}: "\${replyText}"\`);
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {communityFeedLabel}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {communityDescription}
          </p>
        </div>

        <div className="space-y-6">
          {comments.map((comment: any) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
              <div className="flex gap-3">
                <img src={comment.author.avatar} alt={comment.author.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white">{comment.author.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{comment.author.username}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">· {comment.timestamp}</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 mb-3">{comment.content}</p>

                  {comment.image && (
                    <img src={comment.image} alt="Comment attachment" className="rounded-lg mb-3 w-full max-w-lg object-cover" />
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {comment.reactions.map((reaction, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleReaction(comment.id, reaction.emoji)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition-colors"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{reaction.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleLike(comment.id)}
                      className={\`flex items-center gap-2 transition-colors \${likedComments.includes(comment.id) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}\`}
                    >
                      <Heart className={\`h-5 w-5 \${likedComments.includes(comment.id) ? 'fill-red-600' : ''}\`} />
                      <span className="text-sm font-medium">{comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}</span>
                    </button>

                    <button onClick={() => handleReplyClick(comment.id)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">{comment.replies}</span>
                    </button>

                    <button onClick={() => handleShare(comment.id)} className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Send className="h-5 w-5" />
                      <span className="text-sm font-medium">{shareButton}</span>
                    </button>

                    <button
                      onClick={() => toggleSave(comment.id)}
                      className={\`flex items-center gap-2 transition-colors ml-auto \${savedComments.includes(comment.id) ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'}\`}
                    >
                      <Bookmark className={\`h-5 w-5 \${savedComments.includes(comment.id) ? 'fill-yellow-600' : ''}\`} />
                    </button>
                  </div>

                  {replyingTo === comment.id && (
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={replyPlaceholder}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {postReplyButton}
                        </button>
                        <button
                          onClick={handleCancelReply}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {cancelButton}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SocialComments;
    `,

    threaded: `
${commonImports}
import { ThumbsUp, MessageCircle, MoreVertical, Reply } from 'lucide-react';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface ThreadedCommentsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ThreadedComments: React.FC<ThreadedCommentsProps> = ({ ${dataName}: propData, className }) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [expandedReplies, setExpandedReplies] = useState<number[]>([1, 2]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const commentsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const commentData = commentsData || {};

  const title = commentsData?.threadedTitle || '';
  const subtitle = commentsData?.threadedSubtitle || '';
  const initialComments = commentsData?.threadedComments || [];
  const commentsCountLabel = commentsData?.commentsCountLabel || '';
  const joinDiscussionLabel = commentsData?.joinDiscussionLabel || '';
  const replyButton = commentsData?.replyButton || '';
  const postReplyButton = commentsData?.postReplyButton || '';
  const cancelButton = commentsData?.cancelButton || '';
  const replyPlaceholder = commentsData?.replyPlaceholder || '';
  const hideButton = commentsData?.hideButton || '';
  const showButton = commentsData?.showButton || '';
  const repliesLabel = commentsData?.repliesLabel || '';
  const replyLabel = commentsData?.replyLabel || '';
  const authorLabel = commentsData?.authorLabel || '';

  const [comments, setComments] = useState<Comment[]>([]);

  React.useEffect(() => {
    if (Array.isArray(initialComments)) {
      setComments(initialComments);
    }
  }, [initialComments]);

  const toggleLike = (id: number) => {
    console.log(\`Like toggled for comment: \${id}\`);
    setLikedComments(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const toggleReplies = (id: number) => {
    console.log(\`Replies toggled for comment: \${id}\`);
    setExpandedReplies(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const handleReplyClick = (id: number) => {
    console.log(\`Reply clicked for comment: \${id}\`);
    setReplyingTo(id);
    setReplyText('');
  };

  const handleCancelReply = () => {
    console.log('Reply cancelled');
    setReplyingTo(null);
    setReplyText('');
  };

  const handleMoreClick = (id: number) => {
    console.log(\`More options clicked for comment: \${id}\`);
  };

  const handleSubmitReply = (commentId: number) => {
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: Date.now(),
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      content: replyText,
      timestamp: 'Just now',
      likes: 0
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] };
      }
      return comment;
    }));

    console.log(\`Reply posted to comment \${commentId}\`, newReply);
    setExpandedReplies(prev => [...prev, commentId]);
    setReplyingTo(null);
    setReplyText('');
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={isReply ? 'ml-12' : ''}>
      <div className="flex gap-4">
        <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">{comment.author.name}</span>
              {comment.author.role && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded">
                  {comment.author.role === 'Author' ? authorLabel : comment.author.role}
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 ml-2">
            <button
              onClick={() => toggleLike(comment.id)}
              className={\`flex items-center gap-1 text-sm transition-colors \${likedComments.includes(comment.id) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}\`}
            >
              <ThumbsUp className={\`h-4 w-4 \${likedComments.includes(comment.id) ? 'fill-blue-600' : ''}\`} />
              <span>{comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}</span>
            </button>

            <button onClick={() => handleReplyClick(comment.id)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
              <Reply className="h-4 w-4" />
              <span>{replyButton}</span>
            </button>

            <button onClick={() => handleMoreClick(comment.id)} className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 ml-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyPlaceholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {postReplyButton}
                </button>
                <button
                  onClick={handleCancelReply}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {cancelButton}
                </button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-3"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {expandedReplies.includes(comment.id) ? hideButton : showButton} {comment.replies.length} {comment.replies.length === 1 ? replyLabel : repliesLabel}
                </span>
              </button>

              {expandedReplies.includes(comment.id) && (
                <div className="space-y-4">
                  {comment.replies.map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {comments.length} {commentsCountLabel}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {joinDiscussionLabel}
          </p>
        </div>

        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
        </div>
      </Card>
    </div>
  );
};

export default ThreadedComments;
    `
  };

  return variants[variant] || variants.flat;
};
