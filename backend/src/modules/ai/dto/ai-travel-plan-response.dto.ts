import { ApiProperty } from '@nestjs/swagger';

export class ActivityDto {
  @ApiProperty({ example: '1-1' })
  id: string;

  @ApiProperty({ example: '10:00 AM' })
  time: string;

  @ApiProperty({ example: 'Eiffel Tower Visit' })
  name: string;

  @ApiProperty({ example: 'Visit the iconic Eiffel Tower and enjoy panoramic views' })
  description: string;

  @ApiProperty({ example: 'Champ de Mars, 5 Avenue Anatole' })
  location: string;

  @ApiProperty({ example: '3 hours' })
  duration: string;

  @ApiProperty({ example: 30 })
  cost: number;

  @ApiProperty({ example: 'sightseeing' })
  category: string;
}

export class MealDto {
  @ApiProperty({ example: 'meal-1-1' })
  id: string;

  @ApiProperty({ example: 'breakfast' })
  type: 'breakfast' | 'lunch' | 'dinner';

  @ApiProperty({ example: '8:00 AM' })
  time: string;

  @ApiProperty({ example: 'Café de Flore' })
  restaurant: string;

  @ApiProperty({ example: 'French' })
  cuisine: string;

  @ApiProperty({ example: 25 })
  estimatedCost: number;

  @ApiProperty({ example: '172 Boulevard Saint-Germain' })
  location: string;

  @ApiProperty({ example: 'Classic Parisian breakfast' })
  description: string;
}

export class DayItineraryDto {
  @ApiProperty({ example: 1 })
  day: number;

  @ApiProperty({ example: '2024-04-15' })
  date: string;

  @ApiProperty({ example: 'Arrival & Iconic Landmarks' })
  theme: string;

  @ApiProperty({ type: [ActivityDto] })
  activities: ActivityDto[];

  @ApiProperty({ type: [MealDto] })
  meals: MealDto[];
}

export class HotelDto {
  @ApiProperty({ example: 'hotel-1' })
  id: string;

  @ApiProperty({ example: 'Hotel Malte Opera' })
  name: string;

  @ApiProperty({ example: 4.2 })
  rating: number;

  @ApiProperty({ example: 150 })
  pricePerNight: number;

  @ApiProperty({ example: '63 Rue de Richelieu, 75002 Paris' })
  location: string;

  @ApiProperty({ example: ['WiFi', 'Breakfast', '24/7 Reception', 'Air Conditioning'] })
  amenities: string[];

  @ApiProperty({ example: 'Charming boutique hotel near the Louvre' })
  description: string;
}

export class TravelPlanDataDto {
  @ApiProperty({ example: 'plan-abc123' })
  id: string;

  @ApiProperty({ example: 'Paris, France' })
  destination: string;

  @ApiProperty({ example: 3000 })
  budget: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 5 })
  duration: number;

  @ApiProperty({ example: '2024-04-15' })
  startDate: string;

  @ApiProperty({ example: '2024-04-20' })
  endDate: string;

  @ApiProperty({ example: 2850 })
  totalEstimatedCost: number;

  @ApiProperty({ example: ['Romantic', 'Culture', 'Food'] })
  tags: string[];

  @ApiProperty({ type: [DayItineraryDto] })
  itinerary: DayItineraryDto[];

  @ApiProperty({ type: [HotelDto] })
  hotels: HotelDto[];
}

export class AIGeneratedTravelPlanResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: TravelPlanDataDto })
  data: TravelPlanDataDto;

  @ApiProperty({ example: 'Travel plan generated successfully' })
  message: string;
}

export class AIGeneratedTravelPlanErrorDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    example: {
      code: 'INVALID_BUDGET',
      message: 'Budget is too low for the selected destination and duration'
    }
  })
  error: {
    code: string;
    message: string;
  };
}