# AI Travel Plan Generation API Specification

## Overview
This document outlines the API specification for the AI-powered travel plan generation feature. The backend should process user inputs and return a detailed, personalized travel itinerary.

## API Endpoint

```
POST /api/ai/generate-travel-plan
```

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Request Body
```json
{
  "destination": "Paris, France",
  "budget": 3000,
  "duration": 5,
  "startDate": "2024-04-15",
  "travelStyle": "balanced"
}
```

### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| destination | string | Yes | Travel destination city and country | "Paris, France" |
| budget | number | Yes | Total budget in USD | 3000 |
| duration | number | Yes | Number of days (1-30) | 5 |
| startDate | string | Yes | Trip start date (ISO format) | "2024-04-15" |
| travelStyle | string | Yes | Travel preference style | "balanced" |

### Travel Styles
- `budget` - Economical options, hostels, street food, free activities
- `balanced` - Mix of budget and comfort, mid-range hotels
- `luxury` - Premium hotels, fine dining, exclusive experiences
- `adventure` - Outdoor activities, hiking, sports
- `cultural` - Museums, historical sites, local experiences
- `relaxation` - Spa, beaches, leisurely pace

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "plan-abc123",
    "destination": "Paris, France",
    "budget": 3000,
    "currency": "USD",
    "duration": 5,
    "startDate": "2024-04-15",
    "endDate": "2024-04-20",
    "totalEstimatedCost": 2850,
    "tags": ["Romantic", "Culture", "Food"],
    
    "itinerary": [
      {
        "day": 1,
        "date": "2024-04-15",
        "theme": "Arrival & Iconic Landmarks",
        "activities": [
          {
            "id": "1-1",
            "time": "10:00 AM",
            "name": "Eiffel Tower Visit",
            "description": "Visit the iconic Eiffel Tower and enjoy panoramic views",
            "location": "Champ de Mars, 5 Avenue Anatole",
            "duration": "3 hours",
            "cost": 30,
            "category": "sightseeing"
          },
          {
            "id": "1-2",
            "time": "2:00 PM",
            "name": "Louvre Museum",
            "description": "Explore world-famous art including the Mona Lisa",
            "location": "Rue de Rivoli, 75001 Paris",
            "duration": "3 hours",
            "cost": 20,
            "category": "culture"
          },
          {
            "id": "1-3",
            "time": "7:00 PM",
            "name": "Seine River Cruise",
            "description": "Evening cruise with dinner on the Seine",
            "location": "Port de la Bourdonnais",
            "duration": "2 hours",
            "cost": 85,
            "category": "dining"
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
          },
          {
            "id": "meal-1-2",
            "type": "lunch",
            "time": "12:30 PM",
            "restaurant": "L'As du Fallafel",
            "cuisine": "Middle Eastern",
            "estimatedCost": 15,
            "location": "34 Rue des Rosiers",
            "description": "Famous falafel in the Marais"
          },
          {
            "id": "meal-1-3",
            "type": "dinner",
            "time": "8:00 PM",
            "restaurant": "Included in Seine Cruise",
            "cuisine": "French",
            "estimatedCost": 0,
            "location": "Seine River",
            "description": "Dinner cruise included in activity"
          }
        ]
      },
      {
        "day": 2,
        "date": "2024-04-16",
        "theme": "Art & Culture",
        "activities": [
          {
            "id": "2-1",
            "time": "9:00 AM",
            "name": "Versailles Day Trip",
            "description": "Visit the Palace of Versailles and gardens",
            "location": "Place d'Armes, 78000 Versailles",
            "duration": "6 hours",
            "cost": 50,
            "category": "culture"
          },
          {
            "id": "2-2",
            "time": "4:00 PM",
            "name": "Montmartre Walking Tour",
            "description": "Explore the artistic neighborhood and Sacré-Cœur",
            "location": "Montmartre, Paris",
            "duration": "3 hours",
            "cost": 0,
            "category": "sightseeing"
          }
        ],
        "meals": [
          {
            "id": "meal-2-1",
            "type": "breakfast",
            "time": "8:00 AM",
            "restaurant": "Du Pain et des Idées",
            "cuisine": "French Bakery",
            "estimatedCost": 20,
            "location": "34 Rue Yves Toudic",
            "description": "Artisanal pastries"
          },
          {
            "id": "meal-2-2",
            "type": "lunch",
            "time": "1:00 PM",
            "restaurant": "La Petite Venise",
            "cuisine": "French",
            "estimatedCost": 35,
            "location": "Versailles Palace",
            "description": "Lunch at Versailles"
          },
          {
            "id": "meal-2-3",
            "type": "dinner",
            "time": "7:30 PM",
            "restaurant": "La Maison Rose",
            "cuisine": "French Bistro",
            "estimatedCost": 45,
            "location": "2 Rue de l'Abreuvoir, Montmartre",
            "description": "Iconic pink restaurant"
          }
        ]
      }
      // Days 3-5 continue with similar structure...
    ],
    
    "hotels": [
      {
        "id": "hotel-1",
        "name": "Hotel Malte Opera",
        "rating": 4.2,
        "pricePerNight": 150,
        "location": "63 Rue de Richelieu, 75002 Paris",
        "amenities": ["WiFi", "Breakfast", "24/7 Reception", "Air Conditioning"],
        "description": "Charming boutique hotel near the Louvre"
      }
    ]
  },
  "message": "Travel plan generated successfully"
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_BUDGET",
    "message": "Budget is too low for the selected destination and duration"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_DESTINATION | Destination not recognized or invalid |
| INVALID_BUDGET | Budget too low (minimum $100/day) |
| INVALID_DURATION | Duration outside 1-30 days range |
| INVALID_DATE | Start date is in the past |
| AI_GENERATION_ERROR | AI service failed to generate plan |
| RATE_LIMIT_EXCEEDED | Too many requests |

## Business Rules

### Budget Allocation
- **Accommodation**: 30-40% of total budget
- **Food**: 25-30% of total budget  
- **Activities**: 20-25% of total budget
- **Transportation**: 10-15% of total budget
- **Buffer**: 5-10% (unused budget as safety margin)

### Daily Structure
- **Activities**: 2-4 per day depending on duration
- **Meals**: Always 3 meals (breakfast, lunch, dinner)
- **Timing**: Realistic gaps between activities
- **Categories**: Mix of sightseeing, culture, dining, shopping, adventure

### Travel Style Adjustments

#### Budget Style
- Hotel: $50-80/night
- Meals: $30-40/day
- Activities: Focus on free/cheap options

#### Balanced Style  
- Hotel: $100-150/night
- Meals: $60-80/day
- Activities: Mix of paid and free

#### Luxury Style
- Hotel: $200+/night
- Meals: $150+/day
- Activities: Premium experiences

## Implementation Notes

### For Backend Developer

1. **AI Prompt Engineering**
   - Use GPT-4 or similar for generating contextual itineraries
   - Include real locations, actual prices, and practical timings
   - Ensure activities are appropriate for the travel style

2. **Validation**
   ```javascript
   // Minimum budget validation
   const minDailyBudget = 100;
   if (budget / duration < minDailyBudget) {
     throw new Error('Budget too low');
   }
   ```

3. **Date Calculations**
   ```javascript
   // Calculate end date
   const startDateObj = new Date(startDate);
   const endDateObj = new Date(startDateObj);
   endDateObj.setDate(endDateObj.getDate() + duration - 1);
   ```

4. **Cost Verification**
   - Ensure totalEstimatedCost is 85-95% of budget
   - Sum all activities and meals costs
   - Add hotel cost (pricePerNight × duration)

5. **Response Time**
   - Target: 5-10 seconds
   - Consider implementing progress indicators
   - Cache common destinations

### For Frontend Integration

1. **Loading State**
   ```javascript
   setIsGenerating(true);
   try {
     const response = await fetch('/api/ai/generate-travel-plan', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
       body: JSON.stringify(formData)
     });
     const data = await response.json();
     // Process and save the plan
   } finally {
     setIsGenerating(false);
   }
   ```

2. **Save Generated Plan**
   - Store in state management (Redux/Context)
   - Save to localStorage for persistence
   - Navigate to plan detail view

## Example Use Cases

### 5-Day Paris Trip (Balanced)
- Budget: $3000
- Hotel: $150/night × 5 = $750
- Activities: ~$400
- Meals: ~$400
- Local Transport: ~$100
- **Total**: ~$2650 (88% of budget)

### 7-Day Tokyo Trip (Adventure)
- Budget: $4000
- Hotel: $120/night × 7 = $840
- Activities: ~$800 (hiking, tours)
- Meals: ~$560
- Transport: ~$200
- **Total**: ~$3400 (85% of budget)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-10 | Initial specification |