#!/bin/bash

# Quick test script - just replace the token
API_URL="http://localhost:3000/api"

echo "🔐 First, get a JWT token by logging in:"
echo ""
echo "curl -X POST $API_URL/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"your-email@example.com\", \"password\": \"your-password\"}'"
echo ""
echo "Then set your token:"
echo "export JWT_TOKEN='your-token-here'"
echo ""
echo "================================"
echo ""

# Check if JWT_TOKEN is set
if [ -z "$JWT_TOKEN" ]; then
  echo "❌ JWT_TOKEN is not set. Please set it first:"
  echo "export JWT_TOKEN='your-token-here'"
  exit 1
fi

echo "✅ Testing with token: ${JWT_TOKEN:0:20}..."
echo ""

# Test 1: Seed categories
echo "1️⃣ Seeding categories..."
curl -X POST "$API_URL/admin/meditation/seed-categories" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n--------------------------------\n"

# Test 2: Get categories
echo "2️⃣ Getting categories..."
curl -X GET "$API_URL/meditation/categories/detailed" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n--------------------------------\n"

# Test 3: Start a session
echo "3️⃣ Starting meditation session..."
curl -X POST "$API_URL/meditation/sessions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_type": "stress-relief",
    "duration_minutes": 10,
    "mood_before": 5
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n--------------------------------\n"

# Test 4: Get stats
echo "4️⃣ Getting meditation stats..."
curl -X GET "$API_URL/meditation/stats/enhanced" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n✅ Quick test completed!"