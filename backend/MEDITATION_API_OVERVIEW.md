# Meditation Module API Overview

## Database Schema

### Tables

#### 1. `meditation_sessions`
Stores individual meditation session records.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | string | User identifier |
| `session_type` | string | Type of meditation |
| `duration_minutes` | integer | Session duration |
| `mood_before` | integer (nullable) | Pre-meditation mood (1-10) |
| `mood_after` | integer (nullable) | Post-meditation mood (1-10) |
| `notes` | text (nullable) | User notes |
| `guided_audio_id` | string (nullable) | Reference to guided content |
| `metadata` | jsonb | Additional session data |
| `completed_at` | timestamptz | Completion timestamp |
| `created_at` | timestamptz | Creation timestamp |

#### 2. `mental_health_logs`
Stores mental health data and meditation goals.

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | string | User identifier |
| `metadata` | jsonb | Used for storing meditation goals |
| `logged_date` | date | Date of the log entry |
| *(other mental health fields)* | various | Mood scores, anxiety levels, etc. |

## API Endpoints

### Session Management

#### 1. Start Meditation Session
- **POST** `/meditation/sessions`
- **Request Body:**
  ```typescript
  {
    session_type: string;         // Required
    duration_minutes: number;     // Required (1-180)
    mood_before?: number;         // Optional (1-10)
    notes?: string;              // Optional
    guided_audio_id?: string;    // Optional
    technique?: string;          // Optional
    environment?: string;        // Optional
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    background_sounds?: string[];
    tags?: string[];
  }
  ```
- **Response:** Session details with ID

#### 2. Complete/Update Session
- **PUT** `/meditation/sessions/:id`
- **Request Body:**
  ```typescript
  {
    mood_after?: number;          // (1-10)
    notes?: string;
    actual_duration_minutes?: number;
    completion_rating?: number;   // (1-5)
    distractions?: string[];
    insights?: string;
  }
  ```
- **Response:** Updated session details

#### 3. Get Session History
- **GET** `/meditation/sessions`
- **Query Parameters:**
  - `page`, `limit`, `sort_order` (pagination)
  - `session_type`, `start_date`, `end_date` (filters)
  - `technique`, `difficulty_level`, `environment`
  - `min_duration`, `max_duration`
- **Response:** Paginated list of sessions

#### 4. Get Single Session
- **GET** `/meditation/sessions/:id`
- **Response:** Complete session details

#### 5. Delete Session
- **DELETE** `/meditation/sessions/:id`
- **Response:** 204 No Content

### Analytics & Statistics

#### 6. Get Statistics
- **GET** `/meditation/stats`
- **Query:** `timeframe` (7d, 30d, 90d, 365d, 1y)
- **Response:**
  ```typescript
  {
    total_sessions: number;
    total_minutes: number;
    average_session_duration: number;
    completion_rate: number;
    mood_improvement: {
      average: number;
      percentage_improved: number;
    };
    session_types: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    weekly_progress: Array<{
      week: string;
      sessions: number;
      minutes: number;
    }>;
    current_streak: number;
    longest_streak: number;
  }
  ```

#### 7. Get Streak Info
- **GET** `/meditation/streak`
- **Response:** Current and longest streak details

### Goals Management

#### 8. Set Goal
- **POST** `/meditation/goals`
- **Request Body:**
  ```typescript
  {
    goal_type: string;           // Required
    target_value: number;        // Required
    target_unit: 'sessions' | 'minutes' | 'days';
    time_period: 'daily' | 'weekly' | 'monthly';
    description?: string;
    end_date?: string;
  }
  ```

#### 9. Get Goals
- **GET** `/meditation/goals`
- **Response:** Array of goals with progress

### Reference Data

#### 10. Get Techniques
- **GET** `/meditation/techniques`
- **Response:** Array of meditation techniques with descriptions and benefits

#### 11. Get Session Types
- **GET** `/meditation/session-types`
- **Response:** Available session types

#### 12. Get Environments
- **GET** `/meditation/environments`
- **Response:** Array of environment options

#### 13. Get Background Sounds
- **GET** `/meditation/background-sounds`
- **Response:** Available background sounds

#### 14. Get Goal Types
- **GET** `/meditation/goal-types`
- **Response:** Available goal types

## Key Features

### 1. Session Tracking
- Multiple meditation types and techniques
- Mood tracking (before/after)
- Duration and completion tracking
- Notes and insights recording

### 2. Mental Health Integration
- Automatic mental health logging
- Mood improvement analytics
- Comprehensive wellness tracking

### 3. Streak System
- Daily practice tracking
- Streak notifications
- Historical streak records

### 4. Goal Management
- Flexible goal types (sessions/minutes/days)
- Multiple time periods (daily/weekly/monthly)
- Automatic progress calculation

### 5. Analytics Dashboard
- Session statistics
- Mood improvement metrics
- Practice patterns
- Weekly progress tracking

## Authentication
All endpoints require JWT authentication with user ID from `req.user.sub`.

## Error Handling
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 404: Resource not found
- 500: Internal server error

## Notes for Frontend Integration
1. Session flow: Create session → User meditates → Update session with completion data
2. Goals are stored in mental_health_logs table with special metadata
3. Streak calculation considers timezone (sessions on consecutive calendar days)
4. All timestamps are in UTC
5. Metadata fields allow flexible data storage for future features