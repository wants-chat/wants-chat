# Calories Progress API Requirements

## Weight Tracking
```
GET /api/v1/calories/weight-history?days=30
POST /api/v1/calories/weight-entry
Body: { weight_kg: number, date?: string }
```

## Daily Stats
```
GET /api/v1/calories/daily-stats?days=30
Returns: [{ date, consumed_calories, target_calories }]
```

## Progress Photos
```
GET /api/v1/calories/progress-photos
POST /api/v1/calories/progress-photos
Body: FormData { image, type: 'front'|'side'|'back' }
```

## Progress Summary
```
GET /api/v1/calories/progress-summary?days=30
Returns: {
  weight: { current, start, goal, lost, progress_percent },
  calories: { avg_consumed, days_on_target, accuracy_percent },
  recent_photos: photo_urls[]
}
```

**Total: 4 APIs needed for progress tracking functionality**