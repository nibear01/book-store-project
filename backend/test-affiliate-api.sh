#!/bin/bash

# Affiliate Marketing API Test Script
# Make sure your backend server is running on port 5000

BASE_URL="http://localhost:5000/api"
echo "🧪 Testing Affiliate Marketing API"
echo "=================================="
echo ""

# Test 1: Register Affiliate
echo "1️⃣ Testing Affiliate Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/affiliates/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Affiliate",
    "email": "testaffiliate@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "bio": "Test affiliate marketer"
  }')
echo "$REGISTER_RESPONSE" | jq '.'
PROMO_CODE=$(echo "$REGISTER_RESPONSE" | jq -r '.data.promo_code')
echo "✅ Promo Code Generated: $PROMO_CODE"
echo ""

# Test 2: Login Affiliate (will fail until admin approves)
echo "2️⃣ Testing Affiliate Login (should fail - pending approval)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/affiliates/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testaffiliate@example.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Test 3: Validate Promo Code (will fail until approved)
echo "3️⃣ Testing Promo Code Validation (should fail - not active)..."
VALIDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/affiliates/validate-promo" \
  -H "Content-Type: application/json" \
  -d "{
    \"promo_code\": \"$PROMO_CODE\"
  }")
echo "$VALIDATE_RESPONSE" | jq '.'
echo ""

echo "=================================="
echo "✅ Basic tests complete!"
echo ""
echo "📝 Next steps:"
echo "1. Login as admin"
echo "2. Approve the affiliate from admin panel"
echo "3. Test affiliate login again"
echo "4. Test dashboard, commissions, withdrawals"
echo ""
echo "📖 See AFFILIATE_API_DOCS.md for complete API documentation"
