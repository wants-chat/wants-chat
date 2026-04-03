#!/bin/bash

# Test script for Meditation APIs
# Make sure to set your JWT token and API URL

API_URL="http://localhost:3000/api"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

echo "🧘 Testing Meditation APIs..."
echo "================================"

# Function to print response
print_response() {
    echo "Response:"
    echo "$1" | jq '.' 2>/dev/null || echo "$1"
    echo "--------------------------------"
}

# 1. Test Admin - Seed Categories
echo "1. Seeding meditation categories..."
RESPONSE=$(curl -s -X POST \
  "$API_URL/admin/meditation/seed-categories" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")
print_response "$RESPONSE"

# 2. Test Admin - Get Categories
echo "2. Getting all categories..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/admin/meditation/categories" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 3. Test User - Get Categories with Details
echo "3. Getting categories with details (user endpoint)..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/categories/detailed" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 4. Test User - Get Featured Meditations
echo "4. Getting featured meditations..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/featured" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 5. Test User - Start Meditation Session
echo "5. Starting a meditation session..."
SESSION_DATA='{
  "session_type": "stress-relief",
  "duration_minutes": 10,
  "mood_before": 5,
  "notes": "Testing meditation API"
}'
RESPONSE=$(curl -s -X POST \
  "$API_URL/meditation/sessions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SESSION_DATA")
print_response "$RESPONSE"

# Extract session ID if available
SESSION_ID=$(echo "$RESPONSE" | jq -r '.id' 2>/dev/null)

# 6. Test User - Get Session History
echo "6. Getting meditation session history..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/sessions?limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 7. Test User - Complete Session (if we have a session ID)
if [ ! -z "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
  echo "7. Completing meditation session..."
  UPDATE_DATA='{
    "mood_after": 8,
    "actual_duration_minutes": 12,
    "completion_rating": 5,
    "insights": "Felt very relaxed"
  }'
  RESPONSE=$(curl -s -X PUT \
    "$API_URL/meditation/sessions/$SESSION_ID" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_DATA")
  print_response "$RESPONSE"
fi

# 8. Test User - Get Enhanced Stats
echo "8. Getting enhanced meditation stats..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/stats/enhanced?timeframe=30d" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 9. Test User - Get Meditation Techniques
echo "9. Getting meditation techniques..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/techniques" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 10. Test User - Get Current Streak
echo "10. Getting current meditation streak..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/streak" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 11. Test Admin - Create Category
echo "11. Creating a new category (admin)..."
CATEGORY_DATA='{
  "slug": "test-category",
  "name": "Test Category",
  "description": "This is a test category",
  "icon": "🧪",
  "color": "gray",
  "display_order": 99
}'
RESPONSE=$(curl -s -X POST \
  "$API_URL/admin/meditation/categories" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CATEGORY_DATA")
print_response "$RESPONSE"

# 12. Test Admin - Create Program
echo "12. Creating a meditation program..."
PROGRAM_DATA='{
  "name": "7-Day Stress Relief Journey",
  "description": "A week-long program to reduce stress",
  "instructor": "Test Instructor",
  "difficulty": "beginner",
  "duration_days": 7,
  "sessions_count": 7,
  "category": "stress-relief",
  "tags": ["stress", "beginner", "weekly"]
}'
RESPONSE=$(curl -s -X POST \
  "$API_URL/admin/meditation/programs" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PROGRAM_DATA")
print_response "$RESPONSE"

# 13. Test User - Get Programs
echo "13. Getting meditation programs..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/programs" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 14. Test Admin - Create Ambient Sound
echo "14. Creating ambient sound..."
SOUND_DATA='{
  "name": "Ocean Waves",
  "file_url": "https://example.com/sounds/ocean-waves.mp3",
  "icon": "🌊",
  "category": "nature",
  "default_volume": 0.5
}'
RESPONSE=$(curl -s -X POST \
  "$API_URL/admin/meditation/ambient-sounds" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SOUND_DATA")
print_response "$RESPONSE"

# 15. Test User - Get Ambient Sounds
echo "15. Getting ambient sounds..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/ambient-sounds" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 16. Test User - Set Meditation Goal
echo "16. Setting a meditation goal..."
GOAL_DATA='{
  "goal_type": "daily_sessions",
  "target_value": 1,
  "target_unit": "sessions",
  "time_period": "daily",
  "description": "Meditate once every day"
}'
RESPONSE=$(curl -s -X POST \
  "$API_URL/meditation/goals" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$GOAL_DATA")
print_response "$RESPONSE"

# 17. Test User - Get Goals
echo "17. Getting meditation goals..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/goals" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

# 18. Test User - Get Audio Library
echo "18. Getting audio library..."
RESPONSE=$(curl -s -X GET \
  "$API_URL/meditation/audio?category=stress-relief" \
  -H "Authorization: Bearer $JWT_TOKEN")
print_response "$RESPONSE"

echo "================================"
echo "✅ Meditation API tests completed!"
echo ""
echo "Note: Replace YOUR_JWT_TOKEN_HERE with a valid JWT token"
echo "You can get a token by logging in via POST /api/auth/login"