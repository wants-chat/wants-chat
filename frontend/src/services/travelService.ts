/**
 * Travel Service
 * Handles all travel planning and management API calls
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface TravelPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  destination: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  budget?: {
    total: number;
    currency: string;
    spent?: number;
    categories: {
      accommodation: number;
      transportation: number;
      food: number;
      activities: number;
      shopping: number;
      other: number;
    };
  };
  travelers: Array<{
    name: string;
    email?: string;
    age?: number;
    relationship: string;
  }>;
  status: 'planning' | 'booked' | 'ongoing' | 'completed' | 'cancelled';
  activities: TravelActivity[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  documents: TravelDocument[];
  notes?: string;
  isPublic: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TravelActivity {
  id: string;
  planId: string;
  name: string;
  description?: string;
  type: 'sightseeing' | 'restaurant' | 'adventure' | 'cultural' | 'shopping' | 'entertainment' | 'relaxation' | 'other';
  location: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  scheduledDate?: Date;
  duration?: number; // in hours
  cost?: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  bookingInfo?: {
    confirmationNumber?: string;
    website?: string;
    phone?: string;
    email?: string;
  };
  rating?: number; // 1-5
  status: 'planned' | 'booked' | 'completed' | 'cancelled';
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Accommodation {
  id: string;
  planId: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'house' | 'resort' | 'bnb' | 'other';
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  cost: {
    totalAmount: number;
    perNight: number;
    currency: string;
    taxes?: number;
    fees?: number;
  };
  booking: {
    confirmationNumber?: string;
    platform?: string;
    website?: string;
    phone?: string;
    email?: string;
  };
  amenities?: string[];
  rating?: number;
  status: 'planned' | 'booked' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Transportation {
  id: string;
  planId: string;
  type: 'flight' | 'train' | 'bus' | 'car_rental' | 'taxi' | 'subway' | 'ferry' | 'other';
  from: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  to: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  departureDate: Date;
  arrivalDate?: Date;
  duration?: number; // in minutes
  cost?: {
    amount: number;
    currency: string;
    perPerson: boolean;
  };
  booking?: {
    confirmationNumber?: string;
    platform?: string;
    website?: string;
    phone?: string;
    seatNumbers?: string[];
  };
  details?: {
    flightNumber?: string;
    airline?: string;
    trainNumber?: string;
    carModel?: string;
    licensePlate?: string;
  };
  status: 'planned' | 'booked' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelDocument {
  id: string;
  planId: string;
  type: 'passport' | 'visa' | 'ticket' | 'reservation' | 'insurance' | 'vaccination' | 'itinerary' | 'map' | 'other';
  name: string;
  description?: string;
  fileUrl?: string;
  expiryDate?: Date;
  issuer?: string;
  documentNumber?: string;
  tags?: string[];
  isRequired: boolean;
  status: 'missing' | 'pending' | 'obtained' | 'expired';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  bestTimeToVisit?: string;
  averageTemperature?: {
    high: number;
    low: number;
    unit: 'celsius' | 'fahrenheit';
  };
  currency: string;
  languages: string[];
  timeZone: string;
  attractions: Array<{
    name: string;
    type: string;
    description: string;
    rating?: number;
  }>;
  costLevel: 'budget' | 'moderate' | 'expensive' | 'luxury';
  safetyRating?: number; // 1-10
  images: string[];
  tags: string[];
}

export interface TravelRecommendation {
  destination: Destination;
  reasonsToVisit: string[];
  estimatedBudget: {
    budget: number;
    moderate: number;
    luxury: number;
    currency: string;
  };
  suggestedDuration: number; // days
  bestTimeToVisit: string;
  activities: Array<{
    name: string;
    type: string;
    estimatedCost: number;
  }>;
}

export interface TravelStats {
  totalTrips: number;
  totalDays: number;
  countriesVisited: number;
  citiesVisited: number;
  totalSpent: number;
  currency: string;
  favoriteDestinations: Array<{
    destination: string;
    visits: number;
    rating: number;
  }>;
  upcomingTrips: number;
  travelHistory: Array<{
    year: number;
    trips: number;
    days: number;
    spent: number;
  }>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  destination?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class TravelService {
  /**
   * Get user's travel plans
   */
  async getTravelPlans(params?: QueryParams): Promise<{ data: TravelPlan[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getTravelPlans();
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.plans) {
        return {
          data: response.plans,
          total: response.total || response.plans.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Handle both array and paginated responses
      if (Array.isArray(response)) {
        return { 
          data: response, 
          total: response.length,
          page: params?.page || 1,
          limit: params?.limit || 20
        };
      }
      
      // Fallback
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_PLANS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get travel plan by ID
   */
  async getTravelPlan(id: string): Promise<TravelPlan> {
    try {
      return await api.request(`/travel/plans/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_PLAN_FETCH_FAILED'
      );
    }
  }

  /**
   * Create travel plan
   */
  async createTravelPlan(planData: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TravelPlan> {
    try {
      return await api.createTravelPlan(planData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_PLAN_CREATE_FAILED'
      );
    }
  }

  /**
   * Update travel plan
   */
  async updateTravelPlan(id: string, planData: Partial<TravelPlan>): Promise<TravelPlan> {
    try {
      return await api.updateTravelPlan(id, planData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_PLAN_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete travel plan
   */
  async deleteTravelPlan(id: string): Promise<void> {
    try {
      await api.request(`/travel/plans/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_PLAN_DELETE_FAILED'
      );
    }
  }

  /**
   * Add activity to travel plan
   */
  async addActivityToPlan(planId: string, activityData: Omit<TravelActivity, 'id' | 'planId' | 'createdAt' | 'updatedAt'>): Promise<TravelActivity> {
    try {
      return await api.request(`/travel/plans/${planId}/activities`, {
        method: 'POST',
        body: JSON.stringify(activityData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_ACTIVITY_CREATE_FAILED'
      );
    }
  }

  /**
   * Update activity in travel plan
   */
  async updateActivity(planId: string, activityId: string, activityData: Partial<TravelActivity>): Promise<TravelActivity> {
    try {
      return await api.request(`/travel/plans/${planId}/activities/${activityId}`, {
        method: 'PUT',
        body: JSON.stringify(activityData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_ACTIVITY_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete activity from travel plan
   */
  async deleteActivity(planId: string, activityId: string): Promise<void> {
    try {
      await api.request(`/travel/plans/${planId}/activities/${activityId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_ACTIVITY_DELETE_FAILED'
      );
    }
  }

  /**
   * Add accommodation to travel plan
   */
  async addAccommodationToPlan(planId: string, accommodationData: Omit<Accommodation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>): Promise<Accommodation> {
    try {
      return await api.request(`/travel/plans/${planId}/accommodations`, {
        method: 'POST',
        body: JSON.stringify(accommodationData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOMMODATION_CREATE_FAILED'
      );
    }
  }

  /**
   * Update accommodation in travel plan
   */
  async updateAccommodation(planId: string, accommodationId: string, accommodationData: Partial<Accommodation>): Promise<Accommodation> {
    try {
      return await api.request(`/travel/plans/${planId}/accommodations/${accommodationId}`, {
        method: 'PUT',
        body: JSON.stringify(accommodationData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACCOMMODATION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Add transportation to travel plan
   */
  async addTransportationToPlan(planId: string, transportationData: Omit<Transportation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>): Promise<Transportation> {
    try {
      return await api.request(`/travel/plans/${planId}/transportation`, {
        method: 'POST',
        body: JSON.stringify(transportationData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSPORTATION_CREATE_FAILED'
      );
    }
  }

  /**
   * Update transportation in travel plan
   */
  async updateTransportation(planId: string, transportationId: string, transportationData: Partial<Transportation>): Promise<Transportation> {
    try {
      return await api.request(`/travel/plans/${planId}/transportation/${transportationId}`, {
        method: 'PUT',
        body: JSON.stringify(transportationData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSPORTATION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Add document to travel plan
   */
  async addDocumentToPlan(planId: string, documentData: Omit<TravelDocument, 'id' | 'planId' | 'createdAt' | 'updatedAt'>): Promise<TravelDocument> {
    try {
      return await api.request(`/travel/plans/${planId}/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_DOCUMENT_CREATE_FAILED'
      );
    }
  }

  /**
   * Update document in travel plan
   */
  async updateDocument(planId: string, documentId: string, documentData: Partial<TravelDocument>): Promise<TravelDocument> {
    try {
      return await api.request(`/travel/plans/${planId}/documents/${documentId}`, {
        method: 'PUT',
        body: JSON.stringify(documentData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_DOCUMENT_UPDATE_FAILED'
      );
    }
  }

  /**
   * Get destination information
   */
  async getDestinations(params?: { search?: string; country?: string; region?: string; limit?: number }): Promise<Destination[]> {
    try {
      const queryString = params ? Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ) : {};
      const response = await api.request(`/travel/destinations${Object.keys(queryString).length > 0 ? `?${new URLSearchParams(queryString).toString()}` : ''}`);
      return response.destinations || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DESTINATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get destination by ID
   */
  async getDestination(id: string): Promise<Destination> {
    try {
      return await api.request(`/travel/destinations/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DESTINATION_FETCH_FAILED'
      );
    }
  }

  /**
   * Generate travel recommendations using AI
   */
  async getTravelRecommendations(preferences: {
    budget?: number;
    currency?: string;
    duration?: number;
    interests?: string[];
    travelStyle?: string;
    climate?: string;
    season?: string;
  }): Promise<TravelRecommendation[]> {
    try {
      return await api.generateContent('travel_recommendations', 'Generate travel recommendations', preferences);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_RECOMMENDATIONS_FAILED'
      );
    }
  }

  /**
   * Generate itinerary using AI
   */
  async generateItinerary(planId: string, preferences?: {
    pace?: 'relaxed' | 'moderate' | 'packed';
    interests?: string[];
    budget?: number;
  }): Promise<{
    activities: TravelActivity[];
    suggestions: string[];
  }> {
    try {
      return await api.request(`/travel/plans/${planId}/generate-itinerary`, {
        method: 'POST',
        body: JSON.stringify(preferences || {}),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ITINERARY_GENERATION_FAILED'
      );
    }
  }

  /**
   * Get travel statistics
   */
  async getTravelStats(): Promise<TravelStats> {
    try {
      return await api.request('/travel/stats');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_STATS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get weather information for destination
   */
  async getWeatherForecast(coordinates: { latitude: number; longitude: number }, days?: number): Promise<{
    current: {
      temperature: number;
      condition: string;
      humidity: number;
      windSpeed: number;
    };
    forecast: Array<{
      date: string;
      high: number;
      low: number;
      condition: string;
      precipitation: number;
    }>;
  }> {
    try {
      return await api.request(`/travel/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&days=${days || 7}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WEATHER_FORECAST_FAILED'
      );
    }
  }

  /**
   * Toggle favorite status for a travel plan
   */
  async toggleFavorite(planId: string, isFavorite: boolean): Promise<TravelPlan> {
    try {
      return await api.toggleTravelPlanFavorite(planId, isFavorite);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRAVEL_FAVORITE_TOGGLE_FAILED'
      );
    }
  }

  /**
   * Get all favorite travel plans
   */
  async getFavoritePlans(): Promise<TravelPlan[]> {
    try {
      const response = await api.getFavoriteTravelPlans();
      return response.plans || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FAVORITE_PLANS_FETCH_FAILED'
      );
    }
  }
}

export const travelService = new TravelService();