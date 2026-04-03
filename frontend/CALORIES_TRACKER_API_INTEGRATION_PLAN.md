# Calories Tracker API Integration Plan

## Overview
This document outlines the plan for integrating the backend Calories Tracker API with the frontend application.

## API Service Created
- **Location**: `/src/services/caloriesApi.ts`
- **Purpose**: Centralized API client for all calories tracker endpoints
- **Base URL**: `/api/calories`

## Backend API Structure

### Available Endpoints (from calories.controller.ts)

#### 1. Onboarding & Profile
- `POST /api/calories/users/onboarding` - Complete onboarding
- `GET /api/calories/users/profile` - Get user profile
- `PUT /api/calories/users/profile` - Update profile

#### 2. Food Management
- `GET /api/calories/foods/search` - Search foods
- `GET /api/calories/foods/recent` - Get recent foods
- `GET /api/calories/foods/favorites` - Get favorite foods
- `POST /api/calories/foods/custom` - Create custom food

#### 3. Food Logging
- `POST /api/calories/food-logs` - Log food entry
- `GET /api/calories/food-logs/today` - Get today's logs
- `GET /api/calories/food-logs/date/:date` - Get logs by date
- `PUT /api/calories/food-logs/:id` - Update food log
- `DELETE /api/calories/food-logs/:id` - Delete food log

#### 4. Weight Tracking
- `POST /api/calories/weight-logs` - Log weight
- `GET /api/calories/weight-logs/progress` - Get weight progress

#### 5. Water Intake
- `POST /api/calories/water-logs/increment` - Update water intake
- `GET /api/calories/water-logs/today` - Get today's water intake

#### 6. Exercise Tracking
- `POST /api/calories/exercise-logs` - Log exercise
- `GET /api/calories/exercise-logs/today` - Get today's exercises

#### 7. Dashboard & Analytics
- `GET /api/calories/dashboard/summary` - Get dashboard summary
- `GET /api/calories/analytics/weekly` - Get weekly analytics

## Integration Tasks

### Phase 1: Core Functionality (Priority: High)
1. **Onboarding Flow**
   - [ ] Update `CaloriesOnboarding.tsx` to use `caloriesApi.completeOnboarding()`
   - [ ] Store user profile data after successful onboarding
   - [ ] Redirect to dashboard after completion

2. **Dashboard Integration**
   - [ ] Update `CaloriesDashboard.tsx` to fetch data using `caloriesApi.getDashboardSummary()`
   - [ ] Implement real-time data refresh
   - [ ] Handle loading and error states

3. **Food Search & Logging**
   - [ ] Update `FoodSearch.tsx` to use `caloriesApi.searchFoods()`
   - [ ] Update `FoodLog.tsx` to use `caloriesApi.logFoodEntry()`
   - [ ] Implement recent foods functionality

### Phase 2: Tracking Features (Priority: Medium)
1. **Food Diary**
   - [ ] Update `FoodDiary.tsx` to fetch logs using `caloriesApi.getTodaysFoodLogs()`
   - [ ] Implement date navigation with `caloriesApi.getFoodLogsByDate()`
   - [ ] Add edit/delete functionality for food logs

2. **Weight Tracking**
   - [ ] Create weight logging modal/form
   - [ ] Implement weight progress visualization
   - [ ] Add weight history chart

3. **Water Intake**
   - [ ] Update water tracking component to use API
   - [ ] Implement increment/decrement functionality
   - [ ] Add daily goal progress

### Phase 3: Advanced Features (Priority: Low)
1. **Exercise Tracking**
   - [ ] Create exercise logging interface
   - [ ] Display today's exercises
   - [ ] Calculate net calories with exercise

2. **Analytics & Progress**
   - [ ] Update `CaloriesProgress.tsx` to use weekly analytics
   - [ ] Create charts for macro tracking
   - [ ] Implement streak tracking

3. **Profile Management**
   - [ ] Update `CaloriesProfile.tsx` to display and edit profile
   - [ ] Allow goal adjustments
   - [ ] Add settings for units (metric/imperial)

## State Management Strategy

### Using React Context
```typescript
// Create CaloriesContext for managing global state
interface CaloriesContextType {
  profile: UserProfile | null;
  dashboardData: DashboardSummary | null;
  todaysFoodLogs: DailyFoodSummary | null;
  isLoading: boolean;
  refreshDashboard: () => Promise<void>;
  refreshFoodLogs: () => Promise<void>;
}
```

### Local Storage
- Store onboarding completion status
- Cache recent foods for offline access
- Save user preferences (units, theme)

## Error Handling Strategy

1. **API Errors**
   - Display user-friendly error messages
   - Implement retry logic for failed requests
   - Log errors for debugging

2. **Validation**
   - Client-side validation before API calls
   - Display field-specific error messages
   - Prevent invalid data submission

3. **Loading States**
   - Show skeletons during data fetching
   - Implement optimistic updates
   - Provide feedback for user actions

## Testing Plan

1. **Unit Tests**
   - Test API service methods
   - Test data transformations
   - Test error handling

2. **Integration Tests**
   - Test complete user flows
   - Test API integration
   - Test state management

3. **E2E Tests**
   - Test onboarding flow
   - Test food logging journey
   - Test dashboard functionality

## Performance Optimizations

1. **API Calls**
   - Implement request debouncing for search
   - Cache frequently accessed data
   - Use pagination for large datasets

2. **Component Rendering**
   - Memoize expensive calculations
   - Implement lazy loading
   - Optimize re-renders

## Security Considerations

1. **Authentication**
   - All API calls require JWT token
   - Handle token expiration gracefully
   - Implement token refresh logic

2. **Data Privacy**
   - Sanitize user inputs
   - Validate data on frontend
   - Handle sensitive data appropriately

## Next Steps

1. Start with Phase 1 integration
2. Test each integration thoroughly
3. Gather user feedback
4. Iterate based on usage patterns

## Notes for Backend Team

### Current Observations
1. The backend uses JWT authentication with `JwtAuthGuard`
2. User ID is extracted from `req.user.sub` or `req.user.userId`
3. The service uses `AppAtOnceService` for database operations
4. Tables are prefixed with `calories_` (e.g., `calories_user_profiles`)

### Potential Improvements
1. Add pagination metadata to list endpoints
2. Implement batch operations for efficiency
3. Add more detailed error messages
4. Consider adding webhook support for real-time updates

## Development Timeline

- **Week 1**: Complete Phase 1 (Core Functionality)
- **Week 2**: Complete Phase 2 (Tracking Features)
- **Week 3**: Complete Phase 3 (Advanced Features)
- **Week 4**: Testing, bug fixes, and optimization

## Success Metrics

1. **User Engagement**
   - Daily active users
   - Food logging frequency
   - Feature adoption rate

2. **Performance**
   - API response times < 200ms
   - Page load times < 1s
   - Smooth animations (60fps)

3. **Reliability**
   - API uptime > 99.9%
   - Error rate < 0.1%
   - Data consistency 100%