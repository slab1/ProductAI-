#!/bin/bash

# AI Edge Functions Test Script
# Usage: ./test-ai-functions.sh YOUR_ANON_KEY

if [ -z "$1" ]; then
    echo "Usage: ./test-ai-functions.sh YOUR_ANON_KEY"
    echo "Get your anon key from Supabase dashboard"
    exit 1
fi

ANON_KEY=$1
BASE_URL="https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1"

echo "🚀 Testing ProductAI Pro AI Edge Functions"
echo "=========================================="
echo ""

# Test 1: User Story Generator
echo "📝 Testing User Story Generator..."
RESPONSE=$(curl -s -X POST "$BASE_URL/ai-user-story-generator" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "requirement": "User needs to reset their password",
    "featureTitle": "Password Reset Feature", 
    "projectContext": "E-commerce platform with user accounts"
  }')

echo "Response: $RESPONSE"
if [[ $RESPONSE == *"title"* ]] && [[ $RESPONSE == *"userRole"* ]]; then
    echo "✅ User Story Generator: PASSED"
else
    echo "❌ User Story Generator: FAILED"
fi
echo ""

# Test 2: RICE Calculator
echo "🧮 Testing RICE Calculator..."
RESPONSE=$(curl -s -X POST "$BASE_URL/rice-calculator" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "reach": 1000,
    "impact": 3,
    "confidence": 70,
    "effort": 8,
    "feature": "Login Feature"
  }')

echo "Response: $RESPONSE"
if [[ $RESPONSE == *"riceScore"* ]] || [[ $RESPONSE == *"rice_score"* ]]; then
    echo "✅ RICE Calculator: PASSED"
else
    echo "❌ RICE Calculator: FAILED"
fi
echo ""

# Test 3: Competitive Analysis
echo "🔍 Testing Competitive Analysis..."
RESPONSE=$(curl -s -X POST "$BASE_URL/ai-competitive-analysis" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "ProductAI Pro",
    "competitors": ["Asana", "Monday.com", "Jira"],
    "market": "Product Management"
  }')

echo "Response: $RESPONSE"
if [[ $RESPONSE == *"analysis"* ]] || [[ $RESPONSE == *"competitive"* ]]; then
    echo "✅ Competitive Analysis: PASSED"
else
    echo "❌ Competitive Analysis: FAILED"
fi
echo ""

echo "🎯 Test Summary"
echo "==============="
echo "If all tests show ✅ PASSED, your AI Edge Functions are working!"
echo "If any show ❌ FAILED, check:"
echo "1. Functions are deployed: supabase functions list"
echo "2. Environment variables set: supabase secrets list"
echo "3. Function logs: supabase functions logs [function-name]"