import { useState, useEffect } from 'react';
import { travelPlannerService, type TravelPlan } from '../services/travelPlannerService';

export const useTravelPlans = () => {
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch travel plans from API
  const fetchTravelPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await travelPlannerService.getTravelPlans({
        page: 1,
        limit: 100, // Get all plans
      });
      
      // Transform the response data to match our TravelPlan type
      // Handle both camelCase (backend) and snake_case (legacy) field names
      const plans = response.data.map((plan: any) => ({
        id: plan.id,
        destination: plan.destination,
        budget: plan.budget?.totalAmount || plan.budget?.total_amount || (typeof plan.budget === 'number' ? plan.budget : 0),
        currency: plan.budget?.currency || 'USD',
        duration: plan.duration ||
          Math.ceil((new Date(plan.endDate || plan.end_date).getTime() - new Date(plan.startDate || plan.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        startDate: (plan.startDate || plan.start_date)?.split('T')[0],
        endDate: (plan.endDate || plan.end_date)?.split('T')[0],
        created: (plan.createdAt || plan.created_at)?.split('T')[0] || new Date().toISOString().split('T')[0],
        totalEstimatedCost: plan.metadata?.totalEstimatedCost || plan.metadata?.total_estimated_cost || plan.budget?.totalAmount || plan.budget?.total_amount || (typeof plan.budget === 'number' ? plan.budget : 0),
        tags: plan.tags || [],
        isFavorite: plan.isFavorite || plan.isFavourite || plan.is_favorite || plan.is_favourite || false,
        image: plan.coverImageUrl || plan.cover_image_url || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`,
        itinerary: plan.metadata?.itinerary || [],
        hotels: plan.metadata?.hotels || [],
        title: plan.title,
        description: plan.description,
        status: plan.status,
        metadata: plan.metadata,
      }));
      
      setTravelPlans(plans);
    } catch (err) {
      console.error('Failed to fetch travel plans:', err);
      setError('Failed to load travel plans');
    } finally {
      setIsLoading(false);
    }
  };

  // Load plans on mount
  useEffect(() => {
    fetchTravelPlans();
  }, []);

  const addTravelPlan = (plan: TravelPlan) => {
    // For AI-generated plans that haven't been saved yet
    // Add to local state temporarily
    setTravelPlans(prev => {
      // Check if plan already exists to prevent duplicates
      const exists = prev.some(p => p.id === plan.id);
      if (exists) {
        // Update existing plan instead
        return prev.map(p => p.id === plan.id ? plan : p);
      }
      return [plan, ...prev];
    });
  };

  const updateTravelPlan = async (planId: string, updates: Partial<TravelPlan>) => {
    try {
      const updatedPlan = await travelPlannerService.updateTravelPlan(planId, updates);
      setTravelPlans(prev => 
        prev.map(plan => plan.id === planId ? { ...plan, ...updatedPlan } : plan)
      );
    } catch (err) {
      console.error('Failed to update travel plan:', err);
      throw err;
    }
  };

  const deleteTravelPlan = async (planId: string) => {
    try {
      await travelPlannerService.deleteTravelPlan(planId);
      setTravelPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (err) {
      console.error('Failed to delete travel plan:', err);
      throw err;
    }
  };

  const toggleFavorite = async (planId: string) => {
    const plan = travelPlans.find(p => p.id === planId);
    if (!plan) return;

    try {
      const updatedPlan = await travelPlannerService.toggleFavorite(planId, !plan.isFavorite);
      setTravelPlans(prev =>
        prev.map(p =>
          p.id === planId ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  };

  const refreshPlans = () => {
    fetchTravelPlans();
  };

  return {
    travelPlans,
    isLoading,
    error,
    addTravelPlan,
    updateTravelPlan,
    deleteTravelPlan,
    toggleFavorite,
    refreshPlans,
  };
};