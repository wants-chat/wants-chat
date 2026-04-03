#!/bin/bash

# Simple test to check meditation categories

API_URL="http://localhost:3000/api"

# First, let's login to get a token
echo "🔐 Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token (simple grep, might need adjustment based on response format)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Please check login credentials."
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Test seeding categories
echo -e "\n🌱 Testing seed categories..."
SEED_RESPONSE=$(curl -s -X POST "$API_URL/admin/meditation/seed-categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Seed response: $SEED_RESPONSE"

# Test getting categories
echo -e "\n📋 Testing get categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$API_URL/admin/meditation/categories" \
  -H "Authorization: Bearer $TOKEN")

echo "Categories response: $CATEGORIES_RESPONSE"

# Test user endpoint
echo -e "\n👤 Testing user categories endpoint..."
USER_CATEGORIES=$(curl -s -X GET "$API_URL/meditation/categories/detailed" \
  -H "Authorization: Bearer $TOKEN")

echo "User categories response: $USER_CATEGORIES"