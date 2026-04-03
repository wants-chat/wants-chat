# Save AI-Generated Travel Plan API Documentation (Using Existing Endpoint)

## Overview
You can save AI-generated travel plans using the existing travel plan creation endpoint. The AI response data is stored in the `metadata` field, preserving all the detailed information without schema modifications.

## Endpoint

```
POST /api/v1/travel/plans
```

## Authentication

Requires a valid JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Request Format

### Headers
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### Request Body

Map the AI-generated travel plan to the existing CreateTravelPlanDto format:

```json
{
  "title": "Paris, France - 5 Day Trip",
  "description": "AI-generated 5-day travel plan for Paris, France",
  "destination": "Paris, France",
  "start_date": "2024-12-15",
  "end_date": "2024-12-19",
  "travel_type": "leisure",
  "status": "planning",
  "budget": {
    "total_amount": 3000,
    "currency": "USD",
    "categories": {
      "accommodation": 750,
      "transportation": 300,
      "food": 600,
      "activities": 450,
      "shopping": 600,
      "other": 300
    }
  },
  "travelers_count": 1,
  "companions": [],
  "preferences": ["balanced"],
  "tags": ["Romantic", "Culture", "Food"],
  "cover_image_url": null,
  "metadata": {
    "ai_generated": true,
    "ai_plan_id": "plan-abc123",
    "travel_style": "balanced",
    "total_estimated_cost": 2850,
    "itinerary": [
      {
        "day": 1,
        "date": "2024-12-15",
        "theme": "Arrival & Iconic Landmarks",
        "activities": [
          {
            "id": "1-1",
            "time": "10:00 AM",
            "name": "Eiffel Tower Visit",
            "description": "Visit the iconic Eiffel Tower",
            "location": "Champ de Mars, Paris",
            "duration": "3 hours",
            "cost": 30,
            "category": "sightseeing"
          }
        ],
        "meals": [
          {
            "id": "meal-1-1",
            "type": "breakfast",
            "time": "8:00 AM",
            "restaurant": "Café de Flore",
            "cuisine": "French",
            "estimatedCost": 25,
            "location": "172 Boulevard Saint-Germain",
            "description": "Classic Parisian breakfast"
          }
        ]
      }
    ],
    "hotels": [
      {
        "id": "hotel-1",
        "name": "Hotel Malte Opera",
        "rating": 4.2,
        "pricePerNight": 150,
        "location": "63 Rue de Richelieu, Paris",
        "amenities": ["WiFi", "Breakfast", "24/7 Reception"],
        "description": "Charming boutique hotel"
      }
    ]
  }
}
```

## Frontend Integration Example

```typescript
// Map AI response to travel plan creation format
function mapAIResponseToTravelPlan(aiResponse: AIGeneratedTravelPlanResponse): CreateTravelPlanDto {
  const { data } = aiResponse;
  
  // Map travel style to travel type
  const travelTypeMap = {
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
      transportation: Math.max(0, remaining * 0.5),
      food: totalMealsCost,
      activities: totalActivitiesCost,
      shopping: Math.max(0, remaining * 0.3),
      other: Math.max(0, remaining * 0.2)
    };
  };

  return {
    title: `${data.destination} - ${data.duration} Day Trip`,
    description: `AI-generated ${data.duration}-day travel plan for ${data.destination}`,
    destination: data.destination,
    start_date: data.startDate, // Keep as YYYY-MM-DD format
    end_date: data.endDate,     // Keep as YYYY-MM-DD format
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

// Save AI-generated plan
async function saveAIGeneratedPlan(
  aiResponse: AIGeneratedTravelPlanResponse,
  travelStyle: string
): Promise<TravelPlanResponse> {
  const travelPlanData = mapAIResponseToTravelPlan(aiResponse);
  
  const response = await fetch('/api/v1/travel/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(travelPlanData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage example
const handleSaveAIPlan = async () => {
  try {
    setLoading(true);
    
    // Save the AI-generated plan
    const savedPlan = await saveAIGeneratedPlan(aiGeneratedPlan, 'balanced');
    
    // Optionally create itinerary items from the metadata
    if (createDetailedItinerary) {
      await createItineraryItemsFromAI(savedPlan.id, savedPlan.metadata);
    }
    
    // Redirect to the saved plan
    router.push(`/travel/plans/${savedPlan.id}`);
    toast.success('Travel plan saved successfully!');
    
  } catch (error) {
    console.error('Failed to save travel plan:', error);
    toast.error('Failed to save travel plan');
  } finally {
    setLoading(false);
  }
};
```

## Accessing AI Data After Saving

When you retrieve the travel plan, all AI-generated data will be available in the `metadata` field:

```typescript
// Get travel plan with AI data
const travelPlan = await fetch(`/api/v1/travel/plans/${planId}`, {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`
  }
});

const plan = await travelPlan.json();

// Access AI data
const aiItinerary = plan.metadata.itinerary;
const aiHotels = plan.metadata.hotels;
const isAIGenerated = plan.metadata.ai_generated;
```

## Benefits of This Approach

1. **No Schema Changes**: Uses existing database structure
2. **No New Endpoints**: Uses existing travel plan creation endpoint
3. **Full Data Preservation**: All AI details stored in metadata
4. **Flexibility**: Can extract and create detailed items later if needed
5. **Backward Compatible**: Works with existing travel plan features

## Optional: Create Detailed Itinerary Items

If you want to create individual itinerary items from the AI data:

```typescript
async function createItineraryItemsFromAI(
  travelPlanId: string, 
  metadata: any
): Promise<void> {
  if (!metadata.itinerary) return;
  
  for (const day of metadata.itinerary) {
    // Create activities
    for (const activity of day.activities) {
      await fetch(`/api/v1/travel/plans/${travelPlanId}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
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
      await fetch(`/api/v1/travel/plans/${travelPlanId}/itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
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
```

## Summary

- Use existing `POST /api/v1/travel/plans` endpoint
- Store complete AI response in `metadata` field
- No schema modifications needed
- Frontend handles mapping between AI response and travel plan format
- Optionally create detailed itinerary items using existing endpoints