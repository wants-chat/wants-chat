# Travel AI Favorites API Documentation

This documentation provides frontend developers with the necessary information to integrate the AI Travel Plan Favorites feature.

## Base URL
```
https://your-api-domain.com/travel
```

## Authentication
All endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints

### 1. Toggle AI Travel Plan Favorite Status

**Endpoint:** `POST /travel/favourite`

**Description:** Add or remove an AI-generated travel plan from favorites.

**Request Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_favourite": true
}
```

**Request Body Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | ID of the AI generation to toggle |
| `is_favourite` | boolean | Yes | `true` to add to favorites, `false` to remove |

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_favourite": true,
  "message": "Added to favourites"
}
```

**Error Responses:**

**404 Not Found Example:**
```json
{
  "message": "AI generation not found",
  "error": "Not Found",
  "statusCode": 404
}
```

Other possible errors:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid or missing authentication token

**Frontend Example:**
```javascript
// Add to favorites
const toggleFavorite = async (id, isFavorite) => {
  try {
    const response = await fetch('/travel/favourite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: id,
        is_favourite: isFavorite
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(result.message); // "Added to favourites" or "Removed from favourites"
    return result;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

// Usage
await toggleFavorite('550e8400-e29b-41d4-a716-446655440000', true);  // Add to favorites
await toggleFavorite('550e8400-e29b-41d4-a716-446655440000', false); // Remove from favorites
```

---

### 2. Get Favorite AI Travel Plans

**Endpoint:** `GET /travel/ai/favourites`

**Description:** Retrieve a paginated list of favorite AI-generated travel plans.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `service_type` | string | No | - | Filter by service type (e.g., "travel_planner") |
| `page` | number | No | 1 | Page number (minimum: 1) |
| `limit` | number | No | 10 | Items per page (minimum: 1, maximum: 100) |

**Example Request:**
```
GET /travel/ai/favourites?service_type=travel_planner&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user_123",
      "service_type": "travel_planner",
      "prompt": "Plan a 7-day trip to Paris, France for 2 people with a budget of $3000",
      "result": {
        "destination": "Paris, France",
        "duration": 7,
        "budget": 3000,
        "itinerary": {
          "day1": {
            "activities": ["Arrive in Paris", "Check into hotel", "Visit Eiffel Tower"],
            "estimated_cost": 150
          },
          "day2": {
            "activities": ["Louvre Museum", "Seine River Cruise"],
            "estimated_cost": 120
          }
        },
        "budget_breakdown": {
          "accommodation": 1200,
          "food": 800,
          "activities": 600,
          "transportation": 400
        }
      },
      "result_url": null,
      "parameters": {
        "destination": "Paris, France",
        "budget": 3000,
        "duration": 7,
        "travel_style": "balanced"
      },
      "tokens_used": 1250,
      "processing_time_ms": 3500,
      "status": "completed",
      "error_message": null,
      "metadata": {
        "ai_confidence": 92,
        "generated_by": "ai_agent_v1"
      },
      "is_favourite": true,
      "created_at": "2024-03-15T10:30:00Z",
      "completed_at": "2024-03-15T10:30:05Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

**Response Fields:**

**Main Data Object:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier of the AI generation |
| `user_id` | string | User who created this generation |
| `service_type` | string | Type of AI service (e.g., "travel_planner") |
| `prompt` | string | Original user prompt for AI generation |
| `result` | object | Generated travel plan data |
| `parameters` | object | Input parameters used for generation |
| `status` | string | Generation status ("completed", "pending", "failed") |
| `is_favourite` | boolean | Favorite status |
| `created_at` | string | ISO timestamp of creation |
| `completed_at` | string | ISO timestamp of completion |

**Pagination Object:**
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of favorite items |
| `total_pages` | number | Total number of pages |

**Error Responses:**
- `400 Bad Request`: Invalid query parameters
- `401 Unauthorized`: Invalid or missing authentication token

**Frontend Example:**
```javascript
// Get favorite AI travel plans
const getFavoriteAIPlans = async (page = 1, limit = 10, serviceType = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (serviceType) {
      params.append('service_type', serviceType);
    }
    
    const response = await fetch(`/travel/ai/favourites?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching favorite AI plans:', error);
    throw error;
  }
};

// Usage
const favorites = await getFavoriteAIPlans(1, 10, 'travel_planner');
console.log(`Found ${favorites.pagination.total} favorite AI plans`);
```

---

## Frontend Integration Examples

### React Hook for AI Favorites

```javascript
import { useState, useEffect } from 'react';

const useAIFavorites = (token) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchFavorites = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        service_type: 'travel_planner'
      });
      
      const response = await fetch(`/travel/ai/favourites?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      setFavorites(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id, isFavorite) => {
    try {
      const response = await fetch('/travel/favourite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: id,
          is_favourite: isFavorite
        })
      });
      
      if (response.ok) {
        // Refresh favorites list
        fetchFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    favorites,
    loading,
    pagination,
    fetchFavorites,
    toggleFavorite
  };
};

// Usage in component
const AIFavoritesComponent = () => {
  const { favorites, loading, pagination, fetchFavorites, toggleFavorite } = useAIFavorites(token);

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Loading favorites...</p>
      ) : (
        <div>
          {favorites.map(favorite => (
            <div key={favorite.id}>
              <h3>{favorite.parameters.destination}</h3>
              <p>Budget: ${favorite.parameters.budget}</p>
              <button 
                onClick={() => toggleFavorite(favorite.id, false)}
              >
                Remove from Favorites
              </button>
            </div>
          ))}
          <div>
            Page {pagination.page} of {pagination.total_pages}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Vue.js Composition API Example

```javascript
import { ref, onMounted } from 'vue';

export const useAIFavorites = (token) => {
  const favorites = ref([]);
  const loading = ref(false);
  const pagination = ref({});

  const fetchFavorites = async (page = 1, limit = 10) => {
    loading.value = true;
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        service_type: 'travel_planner'
      });
      
      const response = await fetch(`/travel/ai/favourites?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      favorites.value = result.data;
      pagination.value = result.pagination;
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      loading.value = false;
    }
  };

  const toggleFavorite = async (id, isFavorite) => {
    try {
      const response = await fetch('/travel/favourite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: id,
          is_favourite: isFavorite
        })
      });
      
      if (response.ok) {
        await fetchFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return {
    favorites,
    loading,
    pagination,
    fetchFavorites,
    toggleFavorite
  };
};
```

---

## Error Handling

### Common HTTP Status Codes
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data or parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Resource not found (AI generation doesn't exist)
- `500 Internal Server Error`: Server error

### Example Error Response
```json
{
  "error": "INVALID_INPUT",
  "message": "Missing required fields: id",
  "details": {
    "missing_fields": ["id"]
  }
}
```

---

## Best Practices

1. **Always handle errors gracefully** - Display user-friendly messages for API failures
2. **Implement loading states** - Show loading indicators during API calls
3. **Cache favorites locally** - Store favorites in local state to reduce API calls
4. **Debounce toggle actions** - Prevent rapid clicking from creating multiple requests
5. **Validate UUIDs** - Ensure AI generation IDs are valid UUIDs before making requests
6. **Paginate effectively** - Implement proper pagination controls for large favorite lists

---

## Testing

### Sample cURL Commands

**Toggle Favorite:**
```bash
curl -X POST "https://your-api-domain.com/travel/favourite" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "is_favourite": true
  }'
```

**Get Favorites:**
```bash
curl "https://your-api-domain.com/travel/ai/favourites?service_type=travel_planner&page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```