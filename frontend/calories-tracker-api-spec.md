# Calories Tracker API Specification

## Overview
This document provides the complete API specification for the Calories Tracker module of Wants Chat. The system allows users to track their daily calorie intake, set nutrition goals, monitor weight progress, and maintain a healthy lifestyle.

## User Journey Flow

### 1. Onboarding Process
1. **Welcome Screen** - Introduction to the calories tracker
2. **Goal Selection** - Choose primary goal (lose weight, gain weight, maintain weight, build muscle)
3. **Personal Information** - Enter gender, age, height, current weight, target weight
4. **Diet Plan** - Select or customize macronutrient distribution (balanced, high protein, low carb, ketogenic, or custom)
5. **Activity Level** - Select activity level (sedentary to extremely active)
6. **Timeline** - Choose weight change rate (0.5-2 kg per week)
7. **Summary** - Display calculated BMR, TDEE, and daily calorie target

### 2. Main Features
- **Dashboard** - Overview of daily nutrition, water intake, weight progress
- **Food Diary** - Log meals with search functionality
- **Food Search** - Search from database or create custom foods
- **Progress Tracking** - Monitor weight changes and goal progress
- **Water Intake** - Track daily hydration
- **Exercise Logging** - Record workouts and calories burned

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    age INTEGER CHECK (age >= 13),
    height_cm INTEGER,
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Nutrition Goals Table
```sql
CREATE TABLE nutrition_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(20) CHECK (goal_type IN ('lose_weight', 'gain_weight', 'maintain_weight', 'build_muscle')),
    weight_change_rate DECIMAL(3,2), -- kg per week
    daily_calories INTEGER,
    protein_percentage INTEGER,
    carbs_percentage INTEGER,
    fat_percentage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Foods Table
```sql
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(50),
    calories_per_100g DECIMAL(6,2),
    protein_per_100g DECIMAL(5,2),
    carbs_per_100g DECIMAL(5,2),
    fat_per_100g DECIMAL(5,2),
    fiber_per_100g DECIMAL(5,2),
    sugar_per_100g DECIMAL(5,2),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for search performance
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
```

### 5. Food Logs Table
```sql
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id),
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
    consumed_at TIMESTAMP NOT NULL,
    calories DECIMAL(8,2),
    protein DECIMAL(8,2),
    carbs DECIMAL(8,2),
    fat DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for daily queries
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, consumed_at);
```

### 6. Weight Logs Table
```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2) NOT NULL,
    logged_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, logged_at)
);
```

### 7. Water Intake Logs Table
```sql
CREATE TABLE water_intake_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    glasses_count INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
```

### 8. Exercise Logs Table
```sql
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER,
    calories_burned DECIMAL(6,2),
    logged_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication Endpoints

#### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### User Profile & Onboarding

#### 3. Complete Onboarding
**POST** `/api/users/onboarding`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "goal": "lose_weight",
  "gender": "male",
  "age": 25,
  "height_cm": 175,
  "current_weight_kg": 80,
  "target_weight_kg": 70,
  "activity_level": "moderately_active",
  "weight_change_rate": 0.5,
  "daily_calories": 2200,
  "protein_percentage": 25,
  "carbs_percentage": 45,
  "fat_percentage": 30
}
```

**Response (201 Created):**
```json
{
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "gender": "male",
    "age": 25,
    "height_cm": 175,
    "current_weight_kg": 80,
    "target_weight_kg": 70,
    "activity_level": "moderately_active",
    "bmr": 1774,
    "tdee": 2750
  },
  "goals": {
    "goal_type": "lose_weight",
    "weight_change_rate": 0.5,
    "daily_calories": 2200,
    "daily_protein_g": 137.5,
    "daily_carbs_g": 247.5,
    "daily_fat_g": 73.3
  }
}
```

#### 4. Get User Profile
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "profile": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "gender": "male",
    "age": 25,
    "height_cm": 175,
    "current_weight_kg": 80,
    "target_weight_kg": 70,
    "activity_level": "moderately_active"
  },
  "goals": {
    "goal_type": "lose_weight",
    "weight_change_rate": 0.5,
    "daily_calories": 2200,
    "protein_percentage": 25,
    "carbs_percentage": 45,
    "fat_percentage": 30
  }
}
```

#### 5. Update User Profile
**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "current_weight_kg": 78.5,
  "activity_level": "very_active"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "current_weight_kg": 78.5,
    "activity_level": "very_active"
  }
}
```

### Food Management

#### 6. Search Foods
**GET** `/api/foods/search?q={query}&category={category}&limit={limit}&offset={offset}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category (fruits, vegetables, proteins, dairy, grains, snacks, beverages)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "foods": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Banana",
      "brand": null,
      "category": "fruits",
      "calories_per_100g": 89,
      "protein_per_100g": 1.1,
      "carbs_per_100g": 22.8,
      "fat_per_100g": 0.3,
      "fiber_per_100g": 2.6,
      "sugar_per_100g": 12.2
    }
  ],
  "total_count": 150,
  "limit": 20,
  "offset": 0
}
```

#### 7. Get Recent Foods
**GET** `/api/foods/recent?limit={limit}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "foods": [
    {
      "food_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Banana",
      "brand": null,
      "category": "fruits",
      "calories_per_100g": 89,
      "protein_per_100g": 1.1,
      "carbs_per_100g": 22.8,
      "fat_per_100g": 0.3,
      "last_consumed": "2025-09-04T07:41:00Z",
      "frequency": 5
    }
  ]
}
```

#### 8. Get Favorite Foods
**GET** `/api/foods/favorites`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "foods": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Banana",
      "category": "fruits",
      "calories_per_100g": 89,
      "protein_per_100g": 1.1,
      "carbs_per_100g": 22.8,
      "fat_per_100g": 0.3
    }
  ]
}
```

#### 9. Create Custom Food
**POST** `/api/foods/custom`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Custom Protein Shake",
  "brand": "Homemade",
  "category": "beverages",
  "calories_per_100g": 120,
  "protein_per_100g": 20,
  "carbs_per_100g": 8,
  "fat_per_100g": 2,
  "fiber_per_100g": 1,
  "sugar_per_100g": 5
}
```

**Response (201 Created):**
```json
{
  "food": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Custom Protein Shake",
    "brand": "Homemade",
    "category": "beverages",
    "is_custom": true,
    "created_by": "user-id"
  }
}
```

### Food Logging

#### 10. Log Food Entry
**POST** `/api/food-logs`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "food_id": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 150,
  "unit": "g",
  "meal_type": "breakfast",
  "consumed_at": "2025-09-04T08:30:00Z"
}
```

**Supported Units:**
- `g` (grams)
- `oz` (ounces)
- `cup`
- `tablespoon`
- `teaspoon`
- `piece/whole`

**Response (201 Created):**
```json
{
  "log": {
    "id": "234e5678-e89b-12d3-a456-426614174001",
    "food_name": "Banana",
    "quantity": 150,
    "unit": "g",
    "meal_type": "breakfast",
    "consumed_at": "2025-09-04T08:30:00Z",
    "calories": 133.5,
    "protein": 1.65,
    "carbs": 34.2,
    "fat": 0.45
  }
}
```

#### 11. Get Today's Food Logs
**GET** `/api/food-logs/today`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "date": "2025-09-04",
  "summary": {
    "total_calories": 1250,
    "total_protein": 85,
    "total_carbs": 140,
    "total_fat": 42,
    "total_fiber": 15,
    "total_sugar": 45,
    "calories_goal": 2250,
    "calories_remaining": 1200,
    "calories_burned": 200,
    "net_calories": 1050
  },
  "macros_percentage": {
    "protein": 27,
    "carbs": 44,
    "fat": 30
  },
  "meals": {
    "breakfast": {
      "calories": 563,
      "protein": 24,
      "carbs": 78,
      "fat": 12,
      "logs": [
        {
          "id": "234e5678-e89b-12d3-a456-426614174001",
          "food_name": "Oatmeal with Berries",
          "quantity": 1,
          "unit": "cup",
          "time": "08:30",
          "calories": 320,
          "protein": 12,
          "carbs": 48,
          "fat": 8
        }
      ]
    },
    "lunch": {
      "calories": 675,
      "protein": 50,
      "carbs": 45,
      "fat": 25,
      "logs": [
        {
          "id": "234e5678-e89b-12d3-a456-426614174002",
          "food_name": "Grilled Chicken Salad",
          "quantity": 350,
          "unit": "g",
          "time": "12:45",
          "calories": 450,
          "protein": 42,
          "carbs": 28,
          "fat": 18
        }
      ]
    },
    "dinner": {
      "calories": 788,
      "protein": 45,
      "carbs": 55,
      "fat": 32,
      "logs": []
    },
    "snacks": {
      "calories": 225,
      "protein": 15,
      "carbs": 20,
      "fat": 8,
      "logs": []
    }
  }
}
```

#### 12. Get Food Logs by Date
**GET** `/api/food-logs/date/{date}`

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `date`: Date in YYYY-MM-DD format

**Response:** Same format as "Get Today's Food Logs"

#### 13. Update Food Log
**PUT** `/api/food-logs/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": 200,
  "unit": "g"
}
```

**Response (200 OK):**
```json
{
  "message": "Food log updated successfully",
  "log": {
    "id": "234e5678-e89b-12d3-a456-426614174001",
    "quantity": 200,
    "calories": 178,
    "protein": 2.2,
    "carbs": 45.6,
    "fat": 0.6
  }
}
```

#### 14. Delete Food Log
**DELETE** `/api/food-logs/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Food log deleted successfully"
}
```

### Weight Tracking

#### 15. Log Weight Entry
**POST** `/api/weight-logs`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "weight_kg": 79.5,
  "date": "2025-09-04"
}
```

**Response (201 Created):**
```json
{
  "log": {
    "id": "345e6789-e89b-12d3-a456-426614174002",
    "weight_kg": 79.5,
    "date": "2025-09-04",
    "bmi": 25.96
  }
}
```

#### 16. Get Weight Progress
**GET** `/api/weight-logs/progress?period={period}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` (optional): Time period (week, month, 3months, 6months, year, all)

**Response (200 OK):**
```json
{
  "summary": {
    "start_weight": 85,
    "current_weight": 80,
    "target_weight": 70,
    "total_lost": 5,
    "remaining": 10,
    "progress_percentage": 33,
    "weekly_average_change": -0.5,
    "projected_goal_date": "2026-01-22"
  },
  "history": [
    {
      "date": "2025-09-04",
      "weight": 80,
      "bmi": 26.12
    },
    {
      "date": "2025-09-01",
      "weight": 80.5,
      "bmi": 26.29
    }
  ],
  "milestones": [
    {
      "weight": 75,
      "label": "Halfway to goal",
      "projected_date": "2025-11-15"
    }
  ]
}
```

### Water Intake

#### 17. Update Water Intake
**POST** `/api/water-logs/increment`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "glasses": 1,
  "date": "2025-09-04"
}
```

**Response (200 OK):**
```json
{
  "date": "2025-09-04",
  "total_glasses": 6,
  "goal": 8,
  "remaining": 2,
  "percentage": 75
}
```

#### 18. Get Water Intake
**GET** `/api/water-logs/today`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "date": "2025-09-04",
  "total_glasses": 5,
  "goal": 8,
  "remaining": 3,
  "percentage": 62.5
}
```

### Exercise Tracking

#### 19. Log Exercise
**POST** `/api/exercise-logs`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "exercise_name": "Running",
  "duration_minutes": 30,
  "calories_burned": 200,
  "logged_at": "2025-09-04T07:00:00Z"
}
```

**Response (201 Created):**
```json
{
  "log": {
    "id": "456e789a-e89b-12d3-a456-426614174003",
    "exercise_name": "Running",
    "duration_minutes": 30,
    "calories_burned": 200,
    "logged_at": "2025-09-04T07:00:00Z"
  }
}
```

#### 20. Get Today's Exercises
**GET** `/api/exercise-logs/today`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "date": "2025-09-04",
  "total_calories_burned": 200,
  "total_duration_minutes": 30,
  "exercises": [
    {
      "id": "456e789a-e89b-12d3-a456-426614174003",
      "exercise_name": "Running",
      "duration_minutes": 30,
      "calories_burned": 200,
      "time": "07:00"
    }
  ]
}
```

### Dashboard & Analytics

#### 21. Get Dashboard Summary
**GET** `/api/dashboard/summary`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "user": {
    "name": "Health Warrior",
    "streak": {
      "current": 7,
      "record": 14,
      "days_to_beat_record": 8
    }
  },
  "today": {
    "date": "2025-09-04",
    "calories": {
      "consumed": 1250,
      "burned": 200,
      "net": 1050,
      "goal": 2250,
      "remaining": 1200,
      "percentage": 47
    },
    "macros": {
      "protein": {
        "current": 85,
        "goal": 150,
        "percentage": 57,
        "remaining": 65
      },
      "carbs": {
        "current": 140,
        "goal": 200,
        "percentage": 70,
        "remaining": 60
      },
      "fat": {
        "current": 42,
        "goal": 65,
        "percentage": 65,
        "remaining": 23
      }
    },
    "water": {
      "current": 5,
      "goal": 8,
      "percentage": 62.5,
      "remaining": 3
    },
    "meals_logged": 3,
    "exercise_minutes": 30
  },
  "weight": {
    "current": 80,
    "start": 85,
    "target": 70,
    "progress_percentage": 33,
    "weekly_change": -0.5,
    "monthly_change": -2.0
  },
  "recommendations": [
    "You need more calories today - consider a healthy snack",
    "Great protein intake! Keep it up",
    "Don't forget to log your water intake"
  ]
}
```

#### 22. Get Weekly Analytics
**GET** `/api/analytics/weekly`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "week_start": "2025-09-02",
  "week_end": "2025-09-08",
  "averages": {
    "daily_calories": 2180,
    "daily_protein": 145,
    "daily_carbs": 195,
    "daily_fat": 63,
    "daily_water": 7.2
  },
  "totals": {
    "calories_consumed": 15260,
    "calories_burned": 1400,
    "net_calories": 13860,
    "exercise_minutes": 210
  },
  "daily_breakdown": [
    {
      "date": "2025-09-02",
      "calories": 2200,
      "protein": 150,
      "carbs": 200,
      "fat": 65,
      "water": 8,
      "weight": 80.5
    }
  ],
  "goals_achievement": {
    "calories": {
      "days_met": 5,
      "percentage": 71
    },
    "protein": {
      "days_met": 6,
      "percentage": 86
    },
    "water": {
      "days_met": 4,
      "percentage": 57
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "message": "The quantity must be a positive number",
  "field": "quantity"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Food item not found"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "age",
      "message": "Age must be at least 13"
    },
    {
      "field": "protein_percentage",
      "message": "Macronutrient percentages must sum to 100"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Implementation Notes

### 1. Authentication & Security
- Use JWT tokens with appropriate expiration (e.g., 7 days)
- Implement refresh token mechanism
- Rate limit authentication endpoints (e.g., 5 attempts per minute)
- Hash passwords using bcrypt with salt rounds >= 10
- Validate all inputs to prevent SQL injection
- Implement CORS properly for frontend integration

### 2. Data Validation Rules
- Email: Valid email format
- Password: Minimum 8 characters
- Age: Must be >= 13
- Weight: Between 20-500 kg
- Height: Between 50-300 cm
- Macronutrient percentages: Must sum to 100%
- Calories: Cannot be negative
- Dates: Cannot be future dates for logs

### 3. Business Logic
- BMR Calculation: Use Mifflin-St Jeor equation
- TDEE = BMR × Activity Level Multiplier
- Activity Level Multipliers:
  - Sedentary: 1.2
  - Lightly Active: 1.375
  - Moderately Active: 1.55
  - Very Active: 1.725
  - Extremely Active: 1.9
- Calorie Deficit/Surplus:
  - 1 kg weight change = 7,700 calories
  - Safe weight loss: 0.5-1 kg per week
  - Safe weight gain: 0.25-0.5 kg per week

### 4. Performance Considerations
- Implement database indexing on frequently queried fields
- Cache food database queries
- Use pagination for list endpoints
- Consider implementing GraphQL for flexible data fetching
- Use connection pooling for database connections

### 5. Data Privacy
- Ensure user data isolation
- Allow users to export their data
- Implement data deletion on account closure
- Don't log sensitive information
- Comply with GDPR/privacy regulations

### 6. Future Enhancements
- Barcode scanning integration
- Recipe creation and management
- Meal planning features
- Social features (share progress, challenges)
- Integration with fitness trackers
- Micronutrient tracking
- Restaurant menu integration
- AI-powered food recognition from photos

## Sample Food Database Entries

```json
[
  {
    "name": "Banana",
    "category": "fruits",
    "calories_per_100g": 89,
    "protein_per_100g": 1.1,
    "carbs_per_100g": 22.8,
    "fat_per_100g": 0.3,
    "fiber_per_100g": 2.6,
    "sugar_per_100g": 12.2
  },
  {
    "name": "Chicken Breast",
    "category": "proteins",
    "calories_per_100g": 165,
    "protein_per_100g": 31,
    "carbs_per_100g": 0,
    "fat_per_100g": 3.6,
    "fiber_per_100g": 0,
    "sugar_per_100g": 0
  },
  {
    "name": "Brown Rice",
    "category": "grains",
    "calories_per_100g": 111,
    "protein_per_100g": 2.6,
    "carbs_per_100g": 23,
    "fat_per_100g": 0.9,
    "fiber_per_100g": 1.8,
    "sugar_per_100g": 0.4
  },
  {
    "name": "Greek Yogurt",
    "brand": "Fage",
    "category": "dairy",
    "calories_per_100g": 130,
    "protein_per_100g": 20,
    "carbs_per_100g": 9,
    "fat_per_100g": 0,
    "fiber_per_100g": 0,
    "sugar_per_100g": 7
  }
]
```