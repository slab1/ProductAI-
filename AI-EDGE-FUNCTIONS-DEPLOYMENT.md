# AI Edge Functions Deployment Guide

## Overview
This guide will help you deploy the 7 AI-powered Edge Functions to your Supabase project manually.

## Prerequisites
1. Supabase CLI installed
2. Supabase project URL and API keys
3. OpenAI API key (for AI functionality)

## Step 1: Install Supabase CLI

```bash
npm install -g @supabase/cli
supabase login
```

## Step 2: Link Your Project

```bash
supabase link --project-ref tdvhmmrvxlwaocfcvdls
```

## Step 3: Set Environment Variables

Add your OpenAI API key to Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

## Step 4: Deploy Edge Functions

Deploy each function individually:

### Batch 1 (First 3 functions)
```bash
# AI User Story Generator
supabase functions deploy ai-user-story-generator

# RICE Calculator  
supabase functions deploy rice-calculator

# AI Competitive Analysis
supabase functions deploy ai-competitive-analysis
```

### Batch 2 (Next 3 functions)
```bash
# AI Roadmap Optimizer
supabase functions deploy ai-roadmap-optimizer

# Sprint Planner
supabase functions deploy sprint-planner

# AI OKR Alignment
supabase functions deploy ai-okr-alignment
```

### Batch 3 (Last 2 functions)
```bash
# AI Communication Generator
supabase functions deploy ai-communication-generator

# Bootstrap Database (Optional)
supabase functions deploy bootstrap-database
```

## Step 5: Verify Deployment

Check function status:
```bash
supabase functions list
```

## Function Details

### 1. ai-user-story-generator
- **Purpose**: Generates user stories using GPT-4
- **Input**: requirement, featureTitle, projectContext
- **Output**: JSON with title, userRole, userGoal, userBenefit, acceptanceCriteria, storyPoints, priority

### 2. rice-calculator
- **Purpose**: Calculates RICE prioritization scores
- **Input**: feature data
- **Output**: RICE scores with prioritization ranking

### 3. ai-competitive-analysis
- **Purpose**: Generates AI-powered competitive analysis
- **Input**: product data, market context
- **Output**: Comprehensive competitive analysis report

### 4. ai-roadmap-optimizer
- **Purpose**: Intelligent roadmap planning
- **Input**: project goals, features, constraints
- **Output**: Optimized roadmap with timeline

### 5. sprint-planner
- **Purpose**: Sprint planning assistant
- **Input**: team capacity, backlog items
- **Output**: Sprint plan with capacity allocation

### 6. ai-okr-alignment
- **Purpose**: OKR alignment engine
- **Input**: company OKRs, team objectives
- **Output**: Aligned OKR recommendations

### 7. ai-communication-generator
- **Purpose**: Communication templates
- **Input**: stakeholder data, communication needs
- **Output**: Customized communication templates

## Testing the Functions

### Test User Story Generator

```bash
curl -X POST 'https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1/ai-user-story-generator' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "requirement": "User needs to reset their password",
    "featureTitle": "Password Reset Feature", 
    "projectContext": "E-commerce platform with user accounts"
  }'
```

### Test RICE Calculator

```bash
curl -X POST 'https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1/rice-calculator' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "reach": 1000,
    "impact": 3,
    "confidence": 70,
    "effort": 8,
    "feature": "Login Feature"
  }'
```

## Troubleshooting

### Common Issues:
1. **Function not found**: Check if function name matches exactly
2. **API key errors**: Verify OPENAI_API_KEY is set correctly
3. **CORS issues**: Ensure CORS headers are properly configured
4. **Timeout**: Functions have 2-minute timeout limit

### Check Function Logs:
```bash
supabase functions logs ai-user-story-generator
```

## File Structure
The functions are located in:
```
/workspace/supabase/functions/
├── ai-user-story-generator/index.ts
├── rice-calculator/index.ts
├── ai-competitive-analysis/index.ts
├── ai-roadmap-optimizer/index.ts
├── sprint-planner/index.ts
├── ai-okr-alignment/index.ts
└── ai-communication-generator/index.ts
```

## Next Steps
After deployment:
1. Test all functions using the provided curl commands
2. Update frontend API calls to use deployed functions
3. Configure frontend environment variables
4. Test the full AI workflow in the application

## Support
If you encounter issues:
1. Check function logs: `supabase functions logs [function-name]`
2. Verify environment variables: `supabase secrets list`
3. Test function endpoints individually
4. Check Supabase dashboard for function status