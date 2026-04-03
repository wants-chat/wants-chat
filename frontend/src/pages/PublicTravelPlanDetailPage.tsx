import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Utensils,
  Hotel,
  Share2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { travelPlannerService, TravelPlan, DayItinerary } from '../services/travelPlannerService';
import { api } from '../lib/api';
import { SEO } from '../components/SEO';
import { PAGE_SEO } from '../config/seo';
import { useConfirm } from '../contexts/ConfirmDialogContext';

const PublicTravelPlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alert } = useConfirm();
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTravelPlan();
    }
  }, [id]);

  const loadTravelPlan = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert URL-friendly destination name back to normal (e.g., "barcelona" -> "Barcelona")
      const destinationName = id!.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Fetch all public travel plans and filter by destination
      const plans = await api.request(`/travel/public/plans?destination=${encodeURIComponent(destinationName)}`);

      if (plans && plans.length > 0) {
        // Use the first matching plan and transform to expected format
        const rawPlan = plans[0];

        // Calculate duration from dates (API returns camelCase)
        const startDate = new Date(rawPlan.startDate || rawPlan.start_date);
        const endDate = new Date(rawPlan.endDate || rawPlan.end_date);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        const transformedPlan: TravelPlan = {
          id: rawPlan.id,
          title: rawPlan.tripName || rawPlan.trip_name || rawPlan.destination,
          destination: rawPlan.destination,
          budget: parseFloat(rawPlan.budget) || 0,
          currency: rawPlan.currency || 'USD',
          duration: duration,
          startDate: rawPlan.startDate || rawPlan.start_date,
          endDate: rawPlan.endDate || rawPlan.end_date,
          created: rawPlan.createdAt || rawPlan.created_at,
          totalEstimatedCost: rawPlan.metadata?.totalEstimatedCost || rawPlan.metadata?.total_estimated_cost || parseFloat(rawPlan.budget) || 0,
          tags: rawPlan.metadata?.tags || [],
          isFavorite: false,
          image: rawPlan.metadata?.coverImageUrl || rawPlan.metadata?.cover_image_url || rawPlan.coverImageUrl ||
                 `https://source.unsplash.com/800x600/?${encodeURIComponent(rawPlan.destination)},travel`,
          itinerary: rawPlan.metadata?.itinerary || [],
          hotels: rawPlan.metadata?.hotels || [],
          status: rawPlan.status || 'planning',
          metadata: {
            ai_generated: rawPlan.metadata?.aiGenerated || rawPlan.metadata?.ai_generated || false,
            travel_style: rawPlan.metadata?.travelStyle || rawPlan.metadata?.travel_style || 'balanced'
          }
        };

        setTravelPlan(transformedPlan);
      } else {
        throw new Error('No travel plans found for this destination');
      }
    } catch (err: any) {
      console.error('Failed to load travel plan:', err);
      setError(err.message || 'Failed to load travel plan');
      // Keep travelPlan as null - show error state instead of sample data
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && travelPlan) {
      navigator.share({
        title: travelPlan.title || travelPlan.destination,
        text: `Check out this ${travelPlan.duration}-day trip to ${travelPlan.destination}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      await alert({
        title: 'Link Copied',
        message: 'Link copied to clipboard!',
        variant: 'success'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate dynamic SEO data
  const planTitle = travelPlan ? `${travelPlan.title || travelPlan.destination} - ${travelPlan.duration} Day Trip | Wants AI` : PAGE_SEO.publicTravelPlans.title;
  const planDescription = travelPlan ? `Explore a ${travelPlan.duration}-day trip to ${travelPlan.destination}. Budget: ${travelPlan.currency} ${travelPlan.budget}. ${travelPlan.tags?.join(', ') || 'Travel planning made easy.'}` : PAGE_SEO.publicTravelPlans.description;
  const planImage = travelPlan?.image || '/og-image.png';
  const planUrl = `${window.location.origin}/travel-plans/${id}`;
  const planKeywords = travelPlan?.tags || ['travel', 'trip planning', 'itinerary', 'vacation'];

  if (isLoading) {
    return (
      <>
        <SEO
          title={PAGE_SEO.publicTravelPlans.title}
          description={PAGE_SEO.publicTravelPlans.description}
          url={PAGE_SEO.publicTravelPlans.url}
        />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      </>
    );
  }

  if (!travelPlan) {
    return (
      <>
        <SEO
          title="Travel Plan Not Found | Wants AI"
          description="The travel plan you are looking for could not be found."
          url={planUrl}
        />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Travel Plan Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The travel plan you are looking for does not exist.
            </p>
            <Button onClick={() => navigate('/travel-plans')}>
              Back to Travel Plans
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={planTitle}
        description={planDescription}
        url={planUrl}
        image={planImage}
        keywords={planKeywords}
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/travel-plans')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Travel Plans
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {travelPlan.image && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={travelPlan.image}
            alt={travelPlan.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                {travelPlan.title || travelPlan.destination}
              </h1>
              <div className="flex flex-wrap gap-4 items-center text-white">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-semibold">{travelPlan.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">{travelPlan.duration} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">
                    {travelPlan.currency} {travelPlan.totalEstimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tags */}
        {travelPlan.tags && travelPlan.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {travelPlan.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trip Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(travelPlan.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(travelPlan.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {travelPlan.currency} {travelPlan.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hotels */}
        {travelPlan.hotels && travelPlan.hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Hotel className="h-8 w-8 text-primary" />
              Recommended Hotels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {travelPlan.hotels.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{hotel.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(hotel.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                            {hotel.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${hotel.pricePerNight}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">per night</div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{hotel.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Day-by-Day Itinerary */}
        {travelPlan.itinerary && travelPlan.itinerary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              Day-by-Day Itinerary
            </h2>

            <div className="space-y-8">
              {travelPlan.itinerary.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dayIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">Day {day.day}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(day.date)}
                          </p>
                        </div>
                        <div className="px-4 py-2 bg-primary/20 rounded-full">
                          <span className="text-sm font-bold text-primary">{day.theme}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {/* Activities */}
                      <div className="space-y-4">
                        {day.activities.map((activity, actIndex) => (
                          <div
                            key={activity.id}
                            className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex-shrink-0 w-20">
                              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                                <Clock className="h-4 w-4" />
                                {activity.time}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                {activity.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {activity.description}
                              </p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-3 w-3" />
                                  {activity.location}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {activity.duration}
                                </span>
                                <span className="flex items-center gap-1 text-primary font-semibold">
                                  <DollarSign className="h-3 w-3" />
                                  {activity.cost}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                  {activity.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Meals */}
                        {day.meals && day.meals.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Utensils className="h-5 w-5 text-primary" />
                              Meals
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {day.meals.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-primary uppercase">
                                      {meal.type}
                                    </span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      {meal.time}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-gray-900 dark:text-white mb-1">
                                    {meal.restaurant}
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {meal.cuisine}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {meal.description}
                                  </p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {meal.location}
                                    </span>
                                    <span className="font-semibold text-primary">
                                      ${meal.estimatedCost}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-10 text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Create Your Own AI Travel Plan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                Get started with AI-powered travel planning and create a personalized
                itinerary for your dream destination.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Your Travel Plan
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default PublicTravelPlanDetailPage;
