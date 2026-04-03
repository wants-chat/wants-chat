import { api } from '../lib/api';

// Types for AI Travel Plan Generation
export interface TravelPlanRequest {
  destination: string;
  budget: number;
  duration: number;
  startDate: string;
  travelStyle: 'budget' | 'balanced' | 'luxury' | 'adventure' | 'cultural' | 'relaxation';
}

export interface Activity {
  id: string;
  time: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  category: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
  location: string;
  description: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  theme: string;
  activities: Activity[];
  meals: Meal[];
}

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  description: string;
}

export interface TravelPlanResponse {
  success: boolean;
  data: {
    id: string;
    destination: string;
    budget: number;
    currency: string;
    duration: number;
    startDate: string;
    endDate: string;
    totalEstimatedCost: number;
    tags: string[];
    itinerary: DayItinerary[];
    hotels: Hotel[];
  };
  message: string;
}

// Types for saving travel plans
export interface CreateTravelPlanDto {
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  travel_type: string;
  status: string;
  budget: {
    total_amount: number;
    currency: string;
    categories: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      shopping: number;
      other: number;
    };
  };
  travelers_count: number;
  companions: any[];
  preferences: string[];
  tags: string[];
  cover_image_url: string | null;
  metadata: {
    ai_generated: true;
    ai_plan_id: string;
    travel_style: string;
    total_estimated_cost: number;
    itinerary: DayItinerary[];
    hotels: Hotel[];
  };
}

// Types for travel plans list
export interface TravelPlan {
  id: string;
  title?: string;
  destination: string;
  budget: number;
  currency: string;
  duration: number;
  startDate: string;
  endDate: string;
  created: string;
  totalEstimatedCost: number;
  tags: string[];
  isFavorite: boolean;
  image?: string;
  itinerary: DayItinerary[];
  hotels: Hotel[];
  status?: string;
  metadata?: any;
}

class TravelPlannerService {
  /**
   * Generate AI travel plan
   */
  async generateTravelPlan(request: TravelPlanRequest): Promise<TravelPlanResponse> {
    console.log('Generating travel plan with request:', request);
    
    const response = await api.request('/ai/generate-travel-plan', {
      method: 'POST',
      body: JSON.stringify({
        destination: request.destination,
        budget: parseInt(request.budget.toString()),
        duration: parseInt(request.duration.toString()),
        startDate: request.startDate,
        travelStyle: request.travelStyle,
      }),
    });

    console.log('Travel plan generated successfully:', response);
    return response;
  }

  /**
   * Map AI response to travel plan DTO for saving
   */
  mapAIResponseToTravelPlan(
    aiResponse: TravelPlanResponse,
    travelStyle: string
  ): CreateTravelPlanDto {
    const { data } = aiResponse;
    
    // Map travel style to travel type
    const travelTypeMap: Record<string, string> = {
      'budget': 'leisure',
      'balanced': 'leisure',
      'luxury': 'leisure',
      'adventure': 'adventure',
      'cultural': 'cultural',
      'relaxation': 'leisure'
    };
    
    // Calculate budget categories from AI response
    const calculateBudgetCategories = () => {
      const totalActivitiesCost = data.itinerary.reduce((sum, day) => {
        const activitiesCost = day.activities.reduce((daySum, activity) => daySum + activity.cost, 0);
        return sum + activitiesCost;
      }, 0);

      const totalMealsCost = data.itinerary.reduce((sum, day) => {
        const mealsCost = day.meals.reduce((daySum, meal) => daySum + meal.estimatedCost, 0);
        return sum + mealsCost;
      }, 0);

      const hotelCost = data.hotels.length > 0 
        ? data.hotels[0].pricePerNight * data.duration 
        : 0;

      const remaining = data.totalEstimatedCost - totalActivitiesCost - totalMealsCost - hotelCost;

      return {
        accommodation: hotelCost,
        transportation: Math.max(0, Math.round(remaining * 0.3)),
        food: totalMealsCost,
        activities: totalActivitiesCost,
        shopping: Math.max(0, Math.round(remaining * 0.4)),
        other: Math.max(0, Math.round(remaining * 0.3))
      };
    };

    return {
      title: `${data.destination} - ${data.duration} Day Trip`,
      description: `AI-generated ${data.duration}-day travel plan for ${data.destination}`,
      destination: data.destination,
      start_date: new Date(data.startDate).toISOString(),
      end_date: new Date(data.endDate).toISOString(),
      travel_type: travelTypeMap[travelStyle] || 'leisure',
      status: 'planning',
      budget: {
        total_amount: data.budget,
        currency: data.currency,
        categories: calculateBudgetCategories()
      },
      travelers_count: 1,
      companions: [],
      preferences: [travelStyle],
      tags: data.tags,
      cover_image_url: null,
      metadata: {
        ai_generated: true,
        ai_plan_id: data.id,
        travel_style: travelStyle,
        total_estimated_cost: data.totalEstimatedCost,
        itinerary: data.itinerary,
        hotels: data.hotels
      }
    };
  }

  /**
   * Save AI-generated travel plan
   */
  async saveAIGeneratedPlan(
    aiResponse: TravelPlanResponse,
    travelStyle: string
  ): Promise<any> {
    const travelPlanData = this.mapAIResponseToTravelPlan(aiResponse, travelStyle);
    
    const response = await api.request('/travel/plans', {
      method: 'POST',
      body: JSON.stringify(travelPlanData)
    });

    return response;
  }

  /**
   * Get all travel plans
   */
  async getTravelPlans(params?: {
    page?: number;
    limit?: number;
    status?: string;
    destination?: string;
  }): Promise<{ data: TravelPlan[]; total: number; page: number; limit: number }> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await api.request(`/travel/plans${queryString}`);
    
    // Handle different response formats
    if (response.plans) {
      return {
        data: response.plans,
        total: response.total || response.plans.length,
        page: response.page || params?.page || 1,
        limit: response.limit || params?.limit || 20
      };
    }
    
    if (response.data) {
      return response;
    }
    
    if (Array.isArray(response)) {
      return { 
        data: response, 
        total: response.length,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    }
    
    return {
      data: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20
    };
  }

  /**
   * Get travel plan by ID
   */
  async getTravelPlan(id: string): Promise<TravelPlan> {
    return await api.request(`/travel/plans/${id}`);
  }

  /**
   * Update travel plan
   */
  async updateTravelPlan(id: string, planData: Partial<TravelPlan>): Promise<TravelPlan> {
    // Remove properties that backend doesn't accept
    const { id: _id, currency, duration, totalEstimatedCost, created, isFavorite, image, itinerary, hotels, ...updateData } = planData;
    
    return await api.request(`/travel/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Delete travel plan
   */
  async deleteTravelPlan(id: string): Promise<void> {
    await api.request(`/travel/plans/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(planId: string, isFavorite: boolean): Promise<TravelPlan> {
    return await api.request(`/travel/favourite`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        is_favourite: isFavorite
      })
    });
  }

  /**
   * Create itinerary items from AI data (optional)
   */
  async createItineraryItemsFromAI(
    travelPlanId: string, 
    metadata: any
  ): Promise<void> {
    if (!metadata.itinerary) return;
    
    const convertTo24Hour = (time: string): string => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    for (const day of metadata.itinerary) {
      // Create activities
      for (const activity of day.activities) {
        await api.request(`/travel/plans/${travelPlanId}/itinerary`, {
          method: 'POST',
          body: JSON.stringify({
            travel_plan_id: travelPlanId,
            item_type: 'activity',
            title: activity.name,
            description: activity.description,
            location: activity.location,
            start_datetime: `${day.date}T${convertTo24Hour(activity.time)}:00`,
            cost: activity.cost,
            status: 'pending',
            priority: 'medium',
            notes: `Duration: ${activity.duration}, Category: ${activity.category}`
          })
        });
      }
      
      // Create meals
      for (const meal of day.meals) {
        await api.request(`/travel/plans/${travelPlanId}/itinerary`, {
          method: 'POST',
          body: JSON.stringify({
            travel_plan_id: travelPlanId,
            item_type: 'meal',
            title: `${meal.type} at ${meal.restaurant}`,
            description: meal.description,
            location: meal.location,
            start_datetime: `${day.date}T${convertTo24Hour(meal.time)}:00`,
            cost: meal.estimatedCost,
            status: 'pending',
            priority: 'medium',
            notes: `Cuisine: ${meal.cuisine}`
          })
        });
      }
    }
  }


  /**
   * Get favorite travel plans
   */
  async getFavoriteTravelPlans(params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    destination?: string;
    travel_type?: string;
    status?: string;
    start_date_from?: string;
    start_date_to?: string;
    min_budget?: number;
    max_budget?: number;
    tags?: string[];
    search?: string;
  }): Promise<{
    data: TravelPlan[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params?.destination) queryParams.append('destination', params.destination);
    if (params?.travel_type) queryParams.append('travel_type', params.travel_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date_from) queryParams.append('start_date_from', params.start_date_from);
    if (params?.start_date_to) queryParams.append('start_date_to', params.start_date_to);
    if (params?.min_budget) queryParams.append('min_budget', params.min_budget.toString());
    if (params?.max_budget) queryParams.append('max_budget', params.max_budget.toString());
    if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    return await api.request(`/travel/favourites${queryString}`);
  }

  /**
   * Get travel statistics
   */
  async getTravelStats(): Promise<any> {
    return await api.request('/travel/stats');
  }

  /**
   * Share travel plan
   */
  async shareTravelPlan(id: string, shareData: {
    email?: string;
    message?: string;
    permissions?: string[];
  }): Promise<{ shareUrl: string; shareCode: string }> {
    return await api.request(`/travel/plans/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData)
    });
  }

  /**
   * Export travel plan (PDF, etc.)
   */
  async exportTravelPlan(id: string, format: 'pdf' | 'json' | 'ical' = 'pdf'): Promise<Blob> {
    // Use the centralized API client's blob method for binary responses
    return await api.blob(`/travel/plans/${id}/export?format=${format}`);
  }

  /**
   * Get public/shared travel plans
   */
  async getPublicTravelPlans(params?: {
    page?: number;
    limit?: number;
    destination?: string;
    travel_type?: string;
    min_budget?: number;
    max_budget?: number;
    tags?: string[];
    search?: string;
  }): Promise<{
    data: TravelPlan[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.destination) queryParams.append('destination', params.destination);
    if (params?.travel_type) queryParams.append('travel_type', params.travel_type);
    if (params?.min_budget) queryParams.append('min_budget', params.min_budget.toString());
    if (params?.max_budget) queryParams.append('max_budget', params.max_budget.toString());
    if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    return await api.request(`/travel/plans/public${queryString}`);
  }

  /**
   * Get public travel plan by ID
   */
  async getPublicTravelPlan(id: string): Promise<TravelPlan> {
    return await api.request(`/travel/plans/public/${id}`);
  }

}

// Export singleton instance
export const travelPlannerService = new TravelPlannerService();

// Re-export types
export type { TravelPlan as TravelPlanType };