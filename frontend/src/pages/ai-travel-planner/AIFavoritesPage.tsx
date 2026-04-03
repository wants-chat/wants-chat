import React, { useState, useEffect } from 'react';
import { Favorite, Star, CalendarMonth, AttachMoney, Hotel } from '@mui/icons-material';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { travelPlannerService, type TravelPlan } from '../../services/travelPlannerService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AIFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchFavorites = async (currentPage = 1) => {
    setLoading(true);
    try {
      const result = await travelPlannerService.getFavoriteTravelPlans({
        page: currentPage,
        limit: 20,
        sort_by: 'start_date',
        sort_order: 'desc'
      });

      // Transform the response data to match TravelPlan type
      // Handle both camelCase (backend) and snake_case (legacy) field names
      const plans = result.data.map((plan: any) => ({
        id: plan.id,
        destination: plan.destination,
        budget: plan.budget?.totalAmount || plan.budget?.total_amount || (typeof plan.budget === 'number' ? plan.budget : 0),
        currency: plan.budget?.currency || 'USD',
        duration: Math.ceil((new Date(plan.endDate || plan.end_date).getTime() - new Date(plan.startDate || plan.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        startDate: (plan.startDate || plan.start_date)?.split('T')[0],
        endDate: (plan.endDate || plan.end_date)?.split('T')[0],
        created: (plan.createdAt || plan.created_at)?.split('T')[0],
        totalEstimatedCost: plan.metadata?.totalEstimatedCost || plan.metadata?.total_estimated_cost || plan.budget?.totalAmount || plan.budget?.total_amount || 0,
        tags: plan.tags || [],
        isFavorite: plan.is_favourite || true,
        image: plan.cover_image_url || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
        itinerary: plan.metadata?.itinerary || [],
        hotels: plan.metadata?.hotels || [],
        title: plan.title,
        description: plan.description,
        status: plan.status,
        metadata: plan.metadata,
      }));

      setFavorites(plans);
      setPage(result.page);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Error fetching favorite travel plans:', error);
      toast.error('Failed to load favorite travel plans');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (planId: string) => {
    try {
      await travelPlannerService.toggleFavorite(planId, false);
      toast.success('Removed from favorites');
      await fetchFavorites(page); // Refresh current page
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleViewPlan = (plan: TravelPlan) => {
    // Navigate to the plan detail page or set it in state
    navigate(`/travel-planner/plan/${plan.id}`);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-white/60">Loading your favorite AI travel plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30">
            <Favorite className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Favorite Travel Plans
          </h1>
        </div>
        <p className="text-white/60">
          Your collection of travel plans you've marked as favorites ({total} total)
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
            <Star className="h-10 w-10 text-teal-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No favorite plans yet
          </h2>
          <p className="text-white/60 mb-6">
            Mark some travel plans as favorites to see them here
          </p>
          <Button
            onClick={() => navigate('/travel-planner')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl"
          >
            View All Plans
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {favorites.map((plan) => (
              <Card
                key={plan.id}
                className="cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/50"
                onClick={() => handleViewPlan(plan)}
              >
                <div className="h-40 sm:h-48 relative overflow-hidden">
                  {plan.image ? (
                    <img src={plan.image} alt={plan.destination} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(plan.id);
                      }}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 h-8 w-8 sm:h-10 sm:w-10 rounded-xl"
                    >
                      <Favorite className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                      {plan.destination}
                    </h3>
                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                      {plan.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-xs border-0">
                          {tag}
                        </Badge>
                      ))}
                      {plan.tags.length > 2 && (
                        <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-xs border-0">
                          +{plan.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-white/70">
                      <CalendarMonth className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {plan.duration} days • {plan.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <AttachMoney className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        Budget: ${plan.budget} {plan.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Hotel className="h-3 w-3 sm:h-4 sm:w-4 text-teal-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{plan.hotels.length} hotels</span>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-white/50 truncate">
                      Added {new Date(plan.created).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-xs bg-white/10 text-white/70 border-white/20">
                      {plan.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => fetchFavorites(page - 1)}
                disabled={page <= 1}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-white/70">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => fetchFavorites(page + 1)}
                disabled={page >= totalPages}
                className="bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIFavoritesPage;