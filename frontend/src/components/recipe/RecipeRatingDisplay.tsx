import React, { useState, useEffect } from 'react';
import { Star, User, ThumbsUp, MessageSquare, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { toast } from '../ui/use-toast';
import { recipeService } from '../../services/recipeService';
import { useAuth } from '../../contexts/AuthContext';

interface Rating {
  id: string;
  userId: string;
  userName?: string;
  recipeId: string;
  rating: number;
  review?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  helpful?: number;
}

interface RecipeRatingDisplayProps {
  recipeId: string;
  averageRating?: number;
  totalRatings?: number;
  onRatingSubmit?: () => void;
  showFullDetails?: boolean;
}

export const RecipeRatingDisplay: React.FC<RecipeRatingDisplayProps> = ({
  recipeId,
  averageRating: propAverageRating = 0,
  totalRatings: propTotalRatings = 0,
  onRatingSubmit,
  showFullDetails = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Local state for average rating and total (calculated from actual ratings)
  const [localAverageRating, setLocalAverageRating] = useState(propAverageRating);
  const [localTotalRatings, setLocalTotalRatings] = useState(propTotalRatings);
  const [hasLoadedRatings, setHasLoadedRatings] = useState(false);

  useEffect(() => {
    if (showFullDetails) {
      loadRatings();
    }
  }, [recipeId, showFullDetails]);

  const loadRatings = async () => {
    try {
      const response = await recipeService.getRecipeRatings(recipeId);

      if (response && response.data) {
        const ratingsData = response.data;

        setRatings(ratingsData);
        calculateDistribution(ratingsData);

        // Calculate and update local average rating and total from actual data
        if (ratingsData.length > 0) {
          const sum = ratingsData.reduce((acc: number, r: Rating) => acc + r.rating, 0);
          const avg = sum / ratingsData.length;
          setLocalAverageRating(avg);
          setLocalTotalRatings(ratingsData.length);
        } else {
          // Reset to 0 if no ratings
          setLocalAverageRating(0);
          setLocalTotalRatings(0);
        }
        setHasLoadedRatings(true);
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
      setHasLoadedRatings(true);
    }
  };

  const calculateDistribution = (ratingsList: Rating[]) => {
    const dist = [0, 0, 0, 0, 0];
    ratingsList.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });
    setRatingDistribution(dist);
  };

  // Use local state if loaded, otherwise use props
  const averageRating = hasLoadedRatings ? localAverageRating : propAverageRating;
  const totalRatings = hasLoadedRatings ? localTotalRatings : propTotalRatings;

  const handleSubmitRating = async () => {
    if (!userRating) {
      toast({
        title: 'Please select a rating',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await recipeService.rateRecipe(recipeId, userRating, userReview);
      toast({
        title: 'Rating submitted successfully',
        description: 'Thank you for your feedback!'
      });
      setShowReviewForm(false);
      setUserRating(0);
      setUserReview('');
      loadRatings();
      if (onRatingSubmit) onRatingSubmit();
    } catch (error) {
      toast({
        title: 'Failed to submit rating',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'h-5 w-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setUserRating(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${size} transition-colors ${
                star <= (interactive ? (hoveredStar || userRating) : rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!showFullDetails) {
    // Simple rating display for cards
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {renderStars(averageRating, false, 'h-4 w-4')}
        </div>
        <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
        {totalRatings > 0 && (
          <span className="text-xs text-gray-500">({totalRatings})</span>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
              Ratings & Reviews
            </span>
            {isAuthenticated && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)} size="sm">
                Write a Review
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inline Review Form */}
          {showReviewForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Rate This Recipe</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowReviewForm(false);
                    setUserRating(0);
                    setUserReview('');
                    setHoveredStar(0);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Share your experience with this recipe
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Rating</label>
                  <div className="flex justify-start">
                    {renderStars(userRating, true, 'h-8 w-8')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                  <Textarea
                    placeholder="Tell others about your experience with this recipe..."
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setUserRating(0);
                      setUserReview('');
                      setHoveredStar(0);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={loading || !userRating}
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  {renderStars(averageRating)}
                  <p className="text-sm text-gray-500 mt-1">
                    Based on {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star - 1];
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-3">{star}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-gray-500 w-10 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {ratings.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Recent Reviews</h4>
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="space-y-2 pb-4 border-b last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {rating.userId === user?.id ? user?.name || user?.email : (rating.userName || 'User')}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.rating, false, 'h-3 w-3')}
                          <span className="text-xs text-gray-500">
                            {rating.createdAt
                              ? new Date(rating.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
                      {rating.review}
                    </p>
                  )}
                </div>
              ))}
              {ratings.length > 5 && (
                <Button variant="outline" className="w-full">
                  Show More Reviews
                </Button>
              )}
            </div>
          )}

          {ratings.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to rate this recipe!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};