# Meditation Module - Frontend Integration Guide

## Overview

This guide provides detailed instructions for integrating the enhanced meditation backend API with your frontend application. The API has been updated based on the frontend requirements to ensure seamless compatibility.

## 🚀 Quick Start

### 1. Initial Setup - Seed Categories

Before using the meditation features, seed the default categories:

```bash
POST /api/admin/meditation/seed-categories
Authorization: Bearer <admin-token>
```

This creates the 8 default meditation categories required by the frontend.

## 📱 Key API Endpoints

### User Endpoints

#### 1. Get Meditation Categories
```typescript
GET /api/meditation/categories/detailed

Response:
[
  {
    id: "stress-relief",
    slug: "stress-relief",
    name: "Stress Relief",
    description: "Quick stress-busting sessions for immediate calm",
    icon: "🌊",
    color: "blue",
    sessionCount: 0
  }
  // ... other categories
]
```

#### 2. Get Featured Meditations (Dynamic Sessions)
```typescript
GET /api/meditation/featured

Response:
{
  categories: [
    {
      id: "after-work",
      name: "After Work",
      description: "Unwind and transition from work to personal time",
      icon: "💼",
      subOptions: [
        {
          id: "stressed",
          name: "Feeling Stressed",
          description: "Release work pressure",
          sessions: [
            {
              duration: 5,
              title: "5-minute stress relief",
              audioUrl: "https://cdn.example.com/audio/stress-relief-5min.mp3"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 3. Start Meditation Session
```typescript
POST /api/meditation/sessions
{
  "session_type": "stress-relief",  // Category slug
  "duration_minutes": 10,
  "mood_before": 5,                 // Optional: 1-10
  "guided_audio_id": "audio-uuid",  // Optional: From audio library
  "notes": "Feeling anxious today"
}

Response:
{
  "id": "session-uuid",
  "session_type": "stress-relief",
  "duration_minutes": 10,
  "mood_before": 5,
  "mood_after": null,
  "notes": "Feeling anxious today",
  "guided_audio_id": "audio-uuid",
  "metadata": {
    "session_status": "in_progress"
  },
  "completed_at": null,
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### 4. Complete Meditation Session
```typescript
PUT /api/meditation/sessions/:sessionId
{
  "mood_after": 8,
  "actual_duration_minutes": 12,
  "completion_rating": 5,
  "distractions": ["noise", "thoughts"],
  "insights": "Felt much calmer after focusing on breath"
}

Response: Updated session with XP earned
```

#### 5. Get Enhanced Statistics (with XP & Achievements)
```typescript
GET /api/meditation/stats/enhanced?timeframe=30d

Response:
{
  // Basic stats
  "total_sessions": 25,
  "total_minutes": 350,
  "average_session_duration": 14,
  "current_streak": 7,
  "longest_streak": 15,
  
  // Mood improvement
  "mood_improvement": {
    "average": 2.5,
    "percentage_improved": 85
  },
  
  // XP & Level
  "level": 3,
  "xp": 3500,
  "nextLevelXp": 900,  // XP needed for next level
  
  // Achievements
  "achievements": [
    {
      "id": "uuid",
      "name": "Week Warrior",
      "description": "Maintain a 7-day meditation streak",
      "icon": "🔥",
      "unlockedAt": "2024-01-10T08:00:00Z"
    }
  ],
  
  // Insights
  "insights": [
    "Amazing 7-day streak! Consistency is key to building lasting habits.",
    "Your meditation practice is significantly improving your mood! Keep it up!"
  ],
  
  // Additional analytics
  "preferredTimeOfDay": "morning",
  "moodImprovementByType": {
    "stress-relief": 3.2,
    "sleep": 2.8,
    "focus": 2.1
  }
}
```

#### 6. Get Audio Library
```typescript
GET /api/meditation/audio?category=stress-relief&type=meditation

Response:
[
  {
    "id": "audio-uuid",
    "title": "10-Minute Stress Relief",
    "description": "Gentle guidance to release tension",
    "fileUrl": "https://cdn.example.com/audio/...",
    "durationSeconds": 600,
    "durationMinutes": 10,
    "type": "meditation",
    "narrator": "Sarah Chen",
    "category": "stress-relief",
    "tags": ["relaxation", "breathing", "beginner"],
    "language": "en",
    "isPremium": false
  }
]
```

#### 7. Get Meditation Programs
```typescript
GET /api/meditation/programs?category=mindfulness&difficulty=beginner

Response:
[
  {
    "id": "program-uuid",
    "name": "7-Day Mindfulness Journey",
    "description": "Build a daily mindfulness practice",
    "instructor": "Dr. Jane Smith",
    "difficulty": "beginner",
    "durationDays": 7,
    "sessionsCount": 7,
    "category": "mindfulness",
    "imageUrl": "https://cdn.example.com/images/...",
    "tags": ["beginner", "daily", "foundation"],
    "isPremium": false
  }
]
```

#### 8. Get Ambient Sounds
```typescript
GET /api/meditation/ambient-sounds

Response:
[
  {
    "id": "sound-uuid",
    "name": "Ocean Waves",
    "fileUrl": "https://cdn.example.com/sounds/ocean.mp3",
    "icon": "🌊",
    "category": "nature",
    "defaultVolume": 0.5
  }
]
```

### Admin Endpoints

#### Upload Audio File
```typescript
POST /api/admin/meditation/audio/upload
Content-Type: multipart/form-data

FormData:
- file: audio_file.mp3
- title: "15-Minute Deep Relaxation"
- description: "Progressive muscle relaxation"
- type: "meditation"
- category: "stress-relief"
- narrator: "John Doe"
- tags: ["relaxation", "deep", "intermediate"]
- is_premium: false

Response:
{
  "id": "audio-uuid",
  "title": "15-Minute Deep Relaxation",
  "file_url": "https://cdn.example.com/audio/...",
  "duration_seconds": 900,
  // ... other fields
}
```

## 🎮 XP & Achievement System

### XP Calculation
- **10 XP** per minute meditated
- **50 XP** bonus for completing daily goal
- **100 XP** for 7-day streak
- **200 XP** for achievement unlock

### Level Progression
- Level formula: `requiredXP = level * level * 100`
- Level 1: 0-100 XP
- Level 2: 101-400 XP
- Level 3: 401-900 XP
- And so on...

### Achievements
The system automatically unlocks achievements:
- **First Steps** (50 XP): Complete first meditation
- **Week Warrior** (200 XP): 7-day streak
- **Dedicated Practitioner** (500 XP): 10 hours total meditation
- **Rising Star** (300 XP): Reach level 5

## 🔄 Frontend Integration Tips

### 1. Session Flow
```typescript
// Start session
const session = await startMeditation({
  session_type: selectedCategory,
  duration_minutes: selectedDuration,
  mood_before: currentMood
});

// Play audio
const audioUrl = selectedAudio.fileUrl;
// Use your audio player

// Complete session
const completed = await completeSession(session.id, {
  mood_after: newMood,
  actual_duration_minutes: actualDuration,
  completion_rating: rating
});

// Show XP earned animation
// Refresh stats to show new achievements
```

### 2. Audio URL Handling
The backend now returns direct `audioUrl` or `fileUrl` instead of IDs:
```typescript
// Old way (deprecated)
guided_audio_id: "uuid"

// New way
audioUrl: "https://cdn.example.com/audio/meditation.mp3"
fileUrl: "https://cdn.example.com/audio/meditation.mp3"
```

### 3. Category Handling
Always use the `slug` field for API calls:
```typescript
// Correct
session_type: "stress-relief"

// Incorrect
session_type: "Stress Relief"
```

### 4. Real-time Features
Consider implementing:
- WebSocket for live meditation stats
- Push notifications for streak reminders
- Offline audio caching
- Background session tracking

## 📊 Analytics Integration

Track these events in your analytics:
```typescript
// Session events
track('meditation_started', {
  category: session.session_type,
  duration: session.duration_minutes,
  has_audio: !!session.guided_audio_id
});

track('meditation_completed', {
  category: session.session_type,
  duration: session.duration_minutes,
  mood_improvement: session.mood_after - session.mood_before,
  rating: session.metadata.completion_rating
});

// Achievement events
track('achievement_unlocked', {
  achievement: achievement.name,
  xp_earned: achievement.xp
});

// Level up events
track('level_up', {
  new_level: stats.level,
  total_xp: stats.xp
});
```

## 🐛 Troubleshooting

### Common Issues

1. **No categories showing**
   - Run the seed categories endpoint
   - Check admin authentication

2. **Audio not playing**
   - Verify CDN URLs are accessible
   - Check CORS settings
   - Ensure audio format compatibility (MP3/M4A)

3. **XP not updating**
   - Sessions must be completed (not just started)
   - Check user_meditation_stats table
   - Verify updateUserXPAndAchievements is called

4. **Achievements not unlocking**
   - Check conditions in checkAndUnlockAchievements
   - Verify user_achievements table unique constraint
   - Ensure stats are calculated correctly

## 🚦 Migration Checklist

- [ ] Update frontend to use `audioUrl` instead of `guided_audio_id`
- [ ] Use category `slug` for all API calls
- [ ] Implement XP/level display in UI
- [ ] Add achievement notifications
- [ ] Update stats dashboard with enhanced metrics
- [ ] Test audio playback with new URLs
- [ ] Implement proper error handling for premium content
- [ ] Add loading states for all API calls

## 📝 Example Frontend Components

### MeditationPlayer Component
```typescript
interface MeditationPlayerProps {
  sessionId: string;
  audioUrl?: string;
  duration: number;
  onComplete: (data: CompletionData) => void;
}

// Handle session completion with rating
const handleComplete = async (completionData) => {
  await updateSession(sessionId, {
    mood_after: completionData.mood,
    actual_duration_minutes: completionData.actualDuration,
    completion_rating: completionData.rating,
    insights: completionData.insights
  });
  
  // Refresh stats to show XP gain
  await refreshUserStats();
};
```

### Achievement Toast Component
```typescript
interface AchievementToastProps {
  achievement: Achievement;
  xpEarned: number;
}

// Show when new achievement unlocked
const AchievementToast = ({ achievement, xpEarned }) => (
  <div className="achievement-toast">
    <span className="icon">{achievement.icon}</span>
    <div>
      <h4>{achievement.name}</h4>
      <p>{achievement.description}</p>
      <span className="xp">+{xpEarned} XP</span>
    </div>
  </div>
);
```

## 🔗 Related Documentation

- [Meditation API Overview](./MEDITATION_API_OVERVIEW.md)
- [Admin API Documentation](./src/modules/admin/meditation/README.md)
- [Database Schema](./src/database/schema.ts)

## 📞 Support

For additional support or questions:
1. Check the API documentation at `/api/docs`
2. Review error messages and logs
3. Contact the backend team with specific error details

Remember to handle all API responses with proper error handling and user feedback!