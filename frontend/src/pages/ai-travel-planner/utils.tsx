import {
  Castle,
  LocationCity,
  BeachAccess,
  Museum,
  Landscape,
  AccountBalance,
  Park,
  NaturePeople,
  Spa,
  Favorite,
  FitnessCenter,
} from '@mui/icons-material';
import type {
  DayPlan,
  HotelRecommendation,
  PopularDestination,
  TripType,
  DestinationImages,
} from '../../types/ai-travel-planner';

export const popularDestinations: PopularDestination[] = [
  { name: 'Paris, France', icon: <Castle className="h-5 w-5" /> },
  { name: 'Tokyo, Japan', icon: <LocationCity className="h-5 w-5" /> },
  { name: 'Bali, Indonesia', icon: <BeachAccess className="h-5 w-5" /> },
  { name: 'New York, USA', icon: <LocationCity className="h-5 w-5" /> },
  { name: 'Rome, Italy', icon: <Museum className="h-5 w-5" /> },
  { name: 'Dubai, UAE', icon: <Landscape className="h-5 w-5" /> },
  { name: 'London, UK', icon: <AccountBalance className="h-5 w-5" /> },
  { name: 'Singapore', icon: <Park className="h-5 w-5" /> },
];

export const tripTypes: TripType[] = [
  { value: 'adventure', label: 'Adventure', icon: <NaturePeople /> },
  { value: 'relaxation', label: 'Relaxation', icon: <Spa /> },
  { value: 'cultural', label: 'Cultural', icon: <Museum /> },
  { value: 'romantic', label: 'Romantic', icon: <Favorite /> },
  { value: 'family', label: 'Family', icon: <FitnessCenter /> },
  { value: 'business', label: 'Business', icon: <AccountBalance /> },
];

export const getDestinationImage = (destination: string): string => {
  const destinationImages: DestinationImages = {
    'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    'Tokyo, Japan': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    'Bali, Indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    'New York, USA': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
    'Rome, Italy': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
    'Dubai, UAE': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'London, UK': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
    'Barcelona, Spain': 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&q=80',
  };
  return (
    destinationImages[destination] ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
  );
};


// Returns an empty itinerary structure - real data should come from API
export const generateEmptyItinerary = (days: number, start: string, _dest: string): DayPlan[] => {
  const itinerary: DayPlan[] = [];
  const startDate = new Date(start);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    itinerary.push({
      day: i + 1,
      date: currentDate.toISOString().split('T')[0],
      title: `Day ${i + 1}`,
      activities: [],
      meals: [],
      accommodation: '',
      notes: '',
    });
  }

  return itinerary;
};

// Alias for backward compatibility - will be removed
export const generateSampleItinerary = generateEmptyItinerary;

// Returns empty hotel list - real data should come from API
export const generateEmptyHotels = (_destination?: string): HotelRecommendation[] => {
  return [];
};

// Alias for backward compatibility - will be removed
export const generateSampleHotels = generateEmptyHotels;