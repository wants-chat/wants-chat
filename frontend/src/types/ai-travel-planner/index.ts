/**
 * AI Travel Planner Types
 * These types define the data structures used throughout the AI Travel Planner application
 */

export interface TravelPlan {
  id: string;
  destination: string;
  budget: number;
  currency: string;
  duration: number;
  startDate: string;
  endDate: string;
  created: string;
  itinerary: DayPlan[];
  hotels: HotelRecommendation[];
  totalEstimatedCost: number;
  tags: string[];
  isFavorite: boolean;
  image?: string;
  title?: string;
  description?: string;
  status?: string;
  metadata?: {
    ai_generated?: boolean;
    ai_plan_id?: string;
    travel_style?: string;
    total_estimated_cost?: number;
    itinerary?: any[];
    hotels?: any[];
    [key: string]: any;
  };
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
  meals: MealPlan[];
  accommodation?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  time: string;
  name: string;
  description: string;
  location: string;
  duration: string;
  cost: number;
  image?: string;
  category: 'sightseeing' | 'adventure' | 'culture' | 'shopping' | 'relaxation' | 'entertainment';
  mapUrl?: string;
  isEditing?: boolean;
}

export interface MealPlan {
  type: 'breakfast' | 'lunch' | 'dinner';
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
  location: string;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  rating: number;
  pricePerNight: number;
  location: string;
  amenities: string[];
  image?: string;
  bookingUrl?: string;
}

export interface PopularDestination {
  name: string;
  icon: React.ReactNode;
}

export interface TripType {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export interface Notification {
  id: string;
  type: 'travel-day' | 'day-before' | 'week-before' | 'general';
  title: string;
  message: string;
  triggerDate: string;
  read?: boolean;
}

export interface FilterState {
  searchQuery: string;
  filterTag: string;
  filterFavorites: 'all' | 'favorites' | 'non-favorites';
  sortBy: 'created' | 'budget' | 'duration' | 'destination';
}

export interface DestinationActivity {
  name: string;
  description: string;
  location: string;
  image: string;
  category: Activity['category'];
}

export interface HotelImages {
  [key: string]: string[];
}

export interface DestinationImages {
  [key: string]: string;
}