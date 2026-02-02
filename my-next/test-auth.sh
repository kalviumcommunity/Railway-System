#!/bin/bash

echo "🧪 Testing Railway Food Management Authentication"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3000"

echo "1️⃣  Testing Admin Login..."
echo "----------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@railway.com","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Login successful!"
  echo ""
  
  echo "2️⃣  Testing Profile Endpoint..."
  echo "----------------------------"
  PROFILE_RESPONSE=$(curl -s "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN")
  echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
  echo ""
  
  echo "3️⃣  Testing Admin Endpoint..."
  echo "----------------------------"
  USERS_RESPONSE=$(curl -s "$BASE_URL/api/admin/users" \
    -H "Authorization: Bearer $TOKEN")
  echo "$USERS_RESPONSE" | jq '.' 2>/dev/null || echo "$USERS_RESPONSE"
  echo ""
  
  echo "4️⃣  Testing Kitchen User Login..."
  echo "----------------------------"
  KITCHEN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"kitchen@railway.com","password":"kitchen123"}')
  echo "$KITCHEN_LOGIN" | jq '.user' 2>/dev/null || echo "$KITCHEN_LOGIN"
  
  KITCHEN_TOKEN=$(echo "$KITCHEN_LOGIN" | jq -r '.token' 2>/dev/null)
  echo ""
  
  echo "5️⃣  Testing Role-Based Access (Kitchen -> Admin endpoint)..."
  echo "----------------------------"
  KITCHEN_ADMIN_ACCESS=$(curl -s "$BASE_URL/api/admin/users" \
    -H "Authorization: Bearer $KITCHEN_TOKEN")
  echo "$KITCHEN_ADMIN_ACCESS" | jq '.' 2>/dev/null || echo "$KITCHEN_ADMIN_ACCESS"
  echo ""
  
  echo "✅ All tests completed!"
else
  echo "❌ Login failed!"
fi

echo ""
echo "=================================================="
