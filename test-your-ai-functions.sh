#!/bin/bash

# ProductAI Pro - AI Functions Test with Your Credentials
# Using your specific ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdmhtbXJ2eGx3YW9jZmN2ZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTMzMDgsImV4cCI6MjA3MTc2OTMwOH0.oI4XEtlLxAp0XFpLvWRhFm9PpjFN4F4SUxSKb1_727c

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdmhtbXJ2eGx3YW9jZmN2ZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTMzMDgsImV4cCI6MjA3MTc2OTMwOH0.oI4XEtlLxAp0XFpLvWRhFm9PpjFN4F4SUxSKb1_727c"
BASE_URL="https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1"

echo "🚀 ProductAI Pro - AI Functions Test"
echo "===================================="
echo "Project: tdvhmmrvxlwaocfcvdls"
echo "Using your ANON KEY"
echo ""

# Test 1: AI User Story Generator
echo "📝 Test 1: AI User Story Generator"
echo "=================================="
RESPONSE=$(curl -s -X POST "$BASE_URL/ai-user-story-generator" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "requirement": "Users need a way to reset their password when they forget it",
    "featureTitle": "Password Reset Feature", 
    "projectContext": "E-commerce platform with user accounts"
  }')

echo "📤 Request sent..."
if [[ $RESPONSE == *"title"* ]] && [[ $RESPONSE == *"userRole"* ]]; then
    echo "✅ SUCCESS! User Story Generator is working!"
    echo ""
    echo "📋 Response Sample:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ FAILED! Response:"
    echo "$RESPONSE"
fi
echo ""

# Test 2: RICE Calculator
echo "🧮 Test 2: RICE Calculator"
echo "=========================="
RESPONSE=$(curl -s -X POST "$BASE_URL/rice-calculator" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "reach": 1500,
    "impact": 3,
    "confidence": 80,
    "effort": 12,
    "feature": "Mobile App Login"
  }')

echo "📤 Request sent..."
if [[ $RESPONSE == *"riceScore"* ]] || [[ $RESPONSE == *"rice_score"* ]] || [[ $RESPONSE == *"total"* ]]; then
    echo "✅ SUCCESS! RICE Calculator is working!"
    echo ""
    echo "📊 Response Sample:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ FAILED! Response:"
    echo "$RESPONSE"
fi
echo ""

# Test 3: AI Competitive Analysis
echo "🔍 Test 3: AI Competitive Analysis"
echo "=================================="
RESPONSE=$(curl -s -X POST "$BASE_URL/ai-competitive-analysis" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "productName": "ProductAI Pro",
    "competitors": ["Asana", "Monday.com", "Jira"],
    "market": "Product Management Software",
    "features": ["User Stories", "RICE Framework", "AI Analysis"]
  }')

echo "📤 Request sent..."
if [[ $RESPONSE == *"analysis"* ]] || [[ $RESPONSE == *"competitive"* ]] || [[ $RESPONSE == *"market"* ]]; then
    echo "✅ SUCCESS! AI Competitive Analysis is working!"
    echo ""
    echo "📊 Response Sample:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ FAILED! Response:"
    echo "$RESPONSE"
fi
echo ""

# Test 4: AI Roadmap Optimizer
echo "🗺️  Test 4: AI Roadmap Optimizer"
echo "================================"
RESPONSE=$(curl -s -X POST "$BASE_URL/ai-roadmap-optimizer" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "goals": ["Increase user engagement", "Improve performance"],
    "features": ["Dashboard redesign", "AI features", "Mobile app"],
    "constraints": "3 month timeline, 2 developers"
  }')

echo "📤 Request sent..."
if [[ $RESPONSE == *"roadmap"* ]] || [[ $RESPONSE == *"timeline"* ]] || [[ $RESPONSE == *"plan"* ]]; then
    echo "✅ SUCCESS! AI Roadmap Optimizer is working!"
    echo ""
    echo "📊 Response Sample:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ FAILED! Response:"
    echo "$RESPONSE"
fi
echo ""

echo "🎯 Test Summary"
echo "==============="
echo "If all tests show ✅ SUCCESS, your AI Edge Functions are deployed and working!"
echo ""
echo "If any test shows ❌ FAILED, check:"
echo "1. Are the functions deployed? Run: supabase functions list"
echo "2. Check function logs: supabase functions logs [function-name]"
echo "3. Verify environment: supabase secrets list"
echo ""
echo "🌐 Your app: https://g4zgg2jikz9r.space.minimax.io"
echo "🎊 Your AI-powered ProductAI Pro should be fully functional!"