# AI Travel Planner API Documentation

## Overview
The AI Travel Planner API generates comprehensive, personalized travel itineraries using AI. It creates detailed day-by-day plans including activities, meals, accommodations, and cost breakdowns based on user preferences.

## Endpoint

```
POST /api/v1/ai/generate-travel-plan
```

## Authentication

All requests require a valid JWT token in the Authorization header:

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

```json
{
  "destination": "Paris, France",
  "budget": 3000,
  "duration": 5,
  "startDate": "2024-12-15",
  "travelStyle": "balanced"
}
```

### Request Parameters

| Field | Type | Required | Validation | Description | Example |
|-------|------|----------|------------|-------------|---------|
| `destination` | string | ✅ Yes | Non-empty string | Travel destination (city, country) | `"Paris, France"` |
| `budget` | number | ✅ Yes | Min: 100 | Total budget in USD | `3000` |
| `duration` | number | ✅ Yes | Min: 1, Max: 30 | Number of travel days | `5` |
| `startDate` | string | ✅ Yes | ISO date format, future date | Trip start date | `"2024-12-15"` |
| `travelStyle` | string | ✅ Yes | Enum values | Travel preference style | `"balanced"` |

### Travel Styles

| Style | Description | Budget Allocation |
|-------|-------------|-------------------|
| `budget` | Economical options, hostels, street food, free activities | Hotels: $50-80/night, Meals: $30-40/day |
| `balanced` | Mix of budget and comfort, mid-range hotels | Hotels: $100-150/night, Meals: $60-80/day |
| `luxury` | Premium hotels, fine dining, exclusive experiences | Hotels: $200+/night, Meals: $150+/day |
| `adventure` | Outdoor activities, hiking, sports, active experiences | Focus on adventure activities |
| `cultural` | Museums, historical sites, local cultural experiences | Focus on cultural attractions |
| `relaxation` | Spa, beaches, leisurely pace, wellness activities | Focus on relaxation activities |

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
    "startDate": "2024-12-15",
    "endDate": "2024-12-19",
    "totalEstimatedCost": 2850,
    "tags": ["Balanced", "Comfortable", "Romantic", "Food"],
    "itinerary": [
      {
        "day": 1,
        "date": "2024-12-15",
        "theme": "Arrival & Iconic Landmarks",
        "activities": [
          {
            "id": "1-1",
            "time": "10:00 AM",
            "name": "Morning Activity",
            "description": "Explore a major attraction",
            "location": "City Center",
            "duration": "3 hours",
            "cost": 30,
            "category": "sightseeing"
          },
          {
            "id": "1-2",
            "time": "2:00 PM",
            "name": "Afternoon Activity",
            "description": "Cultural experience",
            "location": "Historic District",
            "duration": "2 hours",
            "cost": 20,
            "category": "culture"
          },
          {
            "id": "1-3",
            "time": "6:00 PM",
            "name": "Evening Activity",
            "description": "Entertainment or dining experience",
            "location": "Entertainment District",
            "duration": "2 hours",
            "cost": 50,
            "category": "entertainment"
          }
        ],
        "meals": [
          {
            "id": "meal-1-1",
            "type": "breakfast",
            "time": "8:00 AM",
            "restaurant": "Local Breakfast Spot",
            "cuisine": "Continental",
            "estimatedCost": 20,
            "location": "Near Hotel",
            "description": "Start your day with local favorites"
          },
          {
            "id": "meal-1-2",
            "type": "lunch",
            "time": "12:30 PM",
            "restaurant": "Popular Lunch Venue",
            "cuisine": "Local Cuisine",
            "estimatedCost": 30,
            "location": "City Center",
            "description": "Authentic local dishes"
          },
          {
            "id": "meal-1-3",
            "type": "dinner",
            "time": "7:30 PM",
            "restaurant": "Evening Restaurant",
            "cuisine": "International",
            "estimatedCost": 50,
            "location": "Dining District",
            "description": "Memorable dining experience"
          }
        ]
      }
      // Additional days follow the same structure...
    ],
    "hotels": [
      {
        "id": "hotel-1",
        "name": "Comfort Inn Paris, France",
        "rating": 4.2,
        "pricePerNight": 150,
        "location": "City Center, Paris, France",
        "amenities": ["WiFi", "Breakfast", "24/7 Reception", "Air Conditioning"],
        "description": "Well-located hotel perfect for your travel style"
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

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `INVALID_BUDGET` | 400 | Budget too low (minimum $100/day) | Increase budget or reduce duration |
| `INVALID_DATE` | 400 | Start date is in the past | Use a future date |
| `VALIDATION_ERROR` | 400 | Invalid request format/parameters | Check request body format |
| `AI_GENERATION_ERROR` | 500 | AI service failed to generate plan | Retry the request |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Contact support |

## Business Rules

### Budget Validation
- **Minimum Budget**: $100 per day
- **Cost Distribution**: Total estimated cost will be 85-95% of budget
- **Buffer**: 5-15% buffer for unexpected expenses

### Date Validation
- **Start Date**: Must be today or in the future
- **Duration**: 1-30 days maximum

### Itinerary Structure
- **Activities**: 2-4 activities per day
- **Meals**: Always 3 meals per day (breakfast, lunch, dinner)
- **Timing**: Realistic time gaps between activities
- **Daily Themes**: Each day has a thematic focus

## Frontend Integration Examples

### React/TypeScript Example

```typescript
interface TravelPlanRequest {
  destination: string;
  budget: number;
  duration: number;
  startDate: string;
  travelStyle: 'budget' | 'balanced' | 'luxury' | 'adventure' | 'cultural' | 'relaxation';
}

interface TravelPlanResponse {
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

const generateTravelPlan = async (request: TravelPlanRequest): Promise<TravelPlanResponse> => {
  try {
    const response = await fetch('/api/v1/ai/generate-travel-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }

    return await response.json();
  } catch (error) {
    console.error('Travel plan generation failed:', error);
    throw error;
  }
};

// Usage
const handleGeneratePlan = async () => {
  setLoading(true);
  try {
    const plan = await generateTravelPlan({
      destination: "Paris, France",
      budget: 3000,
      duration: 5,
      startDate: "2024-12-15",
      travelStyle: "balanced"
    });
    
    setTravelPlan(plan.data);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### JavaScript/Fetch Example

```javascript
async function generateTravelPlan(formData) {
  const response = await fetch('/api/v1/ai/generate-travel-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      destination: formData.destination,
      budget: parseInt(formData.budget),
      duration: parseInt(formData.duration),
      startDate: formData.startDate,
      travelStyle: formData.travelStyle
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message);
  }

  return await response.json();
}
```

### Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generateTravelPlan = async (data) => {
  try {
    const response = await api.post('/ai/generate-travel-plan', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error.message);
    }
    throw error;
  }
};
```

## Response Time & Performance

- **Expected Response Time**: 5-15 seconds
- **Timeout Recommendation**: Set request timeout to 30 seconds
- **Loading States**: Implement loading indicators for better UX

## Example Requests & Responses

### Budget Travel Example

**Request:**
```json
{
  "destination": "Bangkok, Thailand",
  "budget": 800,
  "duration": 7,
  "startDate": "2024-12-20",
  "travelStyle": "budget"
}
```

**Response Summary:**
- Hotel: ~$65/night
- Daily meals: ~$30-40
- Activities: Focus on free/cheap options
- Total cost: ~$680-750 (85-95% of budget)

### Luxury Travel Example

**Request:**
```json
{
  "destination": "Tokyo, Japan",
  "budget": 5000,
  "duration": 4,
  "startDate": "2024-12-25",
  "travelStyle": "luxury"
}
```

**Response Summary:**
- Hotel: ~$250+/night
- Daily meals: ~$150+
- Activities: Premium experiences
- Total cost: ~$4250-4750 (85-95% of budget)

## Testing

### Test Cases to Implement

1. **Valid Request**: Standard successful request
2. **Invalid Budget**: Budget below minimum ($100/day)
3. **Past Date**: Start date in the past
4. **Invalid Duration**: Duration > 30 days
5. **Missing Fields**: Required fields missing
6. **Invalid Travel Style**: Non-existent travel style
7. **Network Error**: Handle connection failures
8. **Server Error**: Handle 500 errors

### Sample Test Request

```bash
curl -X POST http://localhost:3001/api/v1/ai/generate-travel-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "destination": "Paris, France",
    "budget": 3000,
    "duration": 5,
    "startDate": "2024-12-15",
    "travelStyle": "balanced"
  }'
```

## Notes for Frontend Team

1. **Loading States**: The API can take 5-15 seconds to respond. Implement proper loading indicators.

2. **Error Handling**: Always handle both network errors and API errors gracefully.

3. **Validation**: Implement client-side validation before API calls to improve UX.

4. **Caching**: Consider caching successful responses to avoid re-generating identical plans.

5. **Date Handling**: Ensure dates are in ISO format (YYYY-MM-DD).

6. **Budget Display**: Show cost breakdown and remaining budget clearly to users.

7. **Responsive Design**: Itinerary data is extensive - plan for mobile-friendly display.

8. **Accessibility**: Ensure travel plans are accessible to users with disabilities.

## Support

For technical issues or questions:
- Check the API logs for detailed error messages
- Verify JWT token validity
- Ensure request format matches the specification exactly
- Contact the backend team for server-side issues

---

**Last Updated**: December 2024  
**API Version**: 1.0  
**Status**: Production Ready