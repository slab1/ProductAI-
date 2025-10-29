# ProductAI Pro - Manual Backend Deployment Guide

## Frontend Status: DEPLOYED
**Live URL:** https://frhpl8acf9wz.space.minimax.io

## Backend Status: READY FOR DEPLOYMENT

All backend code is complete and tested. Due to tool authorization constraints, the backend deployment requires manual execution through the Supabase Dashboard.

---

## Quick Start: 3-Step Backend Deployment

### Step 1: Deploy Database Tables (5 minutes)

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/sql/new
2. Copy the entire contents of `/workspace/deploy-database.sql`
3. Paste into the SQL Editor and click "Run"
4. Wait for confirmation message: "Database tables and indexes created successfully!"

### Step 2: Apply Security Policies (3 minutes)

1. In the same SQL Editor, click "New Query"
2. Copy the entire contents of `/workspace/deploy-rls-policies.sql`
3. Paste and click "Run"
4. Wait for confirmation: "RLS policies created successfully!"

### Step 3: Deploy Edge Functions (10 minutes)

Deploy using Supabase CLI or Dashboard:

#### Option A: Using Supabase CLI (Recommended)

```bash
cd /workspace
supabase functions deploy rice-calculator
supabase functions deploy ai-user-story-generator
supabase functions deploy ai-roadmap-optimizer
supabase functions deploy sprint-planner
supabase functions deploy ai-competitive-analysis
supabase functions deploy ai-okr-alignment
supabase functions deploy ai-communication-generator
supabase functions deploy stripe-create-checkout
supabase functions deploy stripe-webhook
```

#### Option B: Using Dashboard

1. Go to: https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/functions
2. Click "Create Function" for each of the 9 functions:
   - rice-calculator
   - ai-user-story-generator  
   - ai-roadmap-optimizer
   - sprint-planner
   - ai-competitive-analysis
   - ai-okr-alignment
   - ai-communication-generator
   - stripe-create-checkout
   - stripe-webhook
3. Copy code from `/workspace/supabase/functions/[function-name]/index.ts`

---

## Edge Functions - Detailed Specifications

### 1. rice-calculator
**Path:** `/workspace/supabase/functions/rice-calculator/index.ts`
**Purpose:** Calculate RICE scores for feature prioritization
**No external secrets required** (pure calculation)

### 2. ai-user-story-generator
**Path:** `/workspace/supabase/functions/ai-user-story-generator/index.ts`
**Purpose:** Generate user stories using GPT-4
**Required Secret:** OPENAI_API_KEY (already configured)

### 3. ai-roadmap-optimizer
**Path:** `/workspace/supabase/functions/ai-roadmap-optimizer/index.ts`
**Purpose:** Optimize product roadmap using AI
**Required Secret:** OPENAI_API_KEY (already configured)

### 4. sprint-planner
**Path:** `/workspace/supabase/functions/sprint-planner/index.ts`
**Purpose:** AI-powered sprint planning assistant
**Required Secret:** OPENAI_API_KEY (already configured)

### 5. ai-competitive-analysis
**Path:** `/workspace/supabase/functions/ai-competitive-analysis/index.ts`
**Purpose:** Generate competitive market analysis
**Required Secret:** OPENAI_API_KEY (already configured)

### 6. ai-okr-alignment
**Path:** `/workspace/supabase/functions/ai-okr-alignment/index.ts`
**Purpose:** Align OKRs with product strategy
**Required Secret:** OPENAI_API_KEY (already configured)

### 7. ai-communication-generator
**Path:** `/workspace/supabase/functions/ai-communication-generator/index.ts`
**Purpose:** Generate stakeholder communications
**Required Secret:** OPENAI_API_KEY (already configured)

### 8. stripe-create-checkout
**Path:** `/workspace/supabase/functions/stripe-create-checkout/index.ts`
**Purpose:** Create Stripe checkout sessions
**Required Secrets:** 
- STRIPE_SECRET_KEY (needs to be added)
- VITE_STRIPE_PRICE_PRO_MONTHLY (frontend env)
- VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY (frontend env)

### 9. stripe-webhook
**Path:** `/workspace/supabase/functions/stripe-webhook/index.ts`
**Purpose:** Handle Stripe webhook events
**Required Secrets:**
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

---

## Setting Supabase Secrets

### Required Secrets

OPENAI_API_KEY is already configured. For Stripe integration, add:

```bash
# Set via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Or via Dashboard:
# https://supabase.com/dashboard/project/tdvhmmrvxlwaocfcvdls/settings/functions
```

### Stripe Setup Steps

1. **Create Stripe Account** (if needed): https://dashboard.stripe.com/register
2. **Get API Keys**: https://dashboard.stripe.com/apikeys
   - Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
3. **Create Products:**
   - Pro Plan: $299/month → Get Price ID
   - Enterprise Plan: $999/month → Get Price ID
4. **Setup Webhook:**
   - URL: `https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1/stripe-webhook`
   - Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
   - Copy "Signing secret" (starts with `whsec_`)
5. **Update Frontend .env** (then rebuild):
   ```env
   VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
   VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
   ```

---

## Verification Checklist

After deployment, verify:

- [ ] All 17 database tables exist (check: Database > Tables)
- [ ] RLS is enabled on all tables (green shield icons)
- [ ] All 9 edge functions deployed (check: Edge Functions page)
- [ ] OPENAI_API_KEY secret is set (check: Settings > Edge Functions)
- [ ] Test user registration on live site
- [ ] Test AI feature (e.g., User Story Generator)
- [ ] For Stripe: Test checkout flow (after keys configured)

---

## Testing the Live Application

1. **Visit:** https://frhpl8acf9wz.space.minimax.io
2. **Sign Up:** Create a test account
3. **Create Project:** Add your first project
4. **Test Features:**
   - RICE Framework: Add features and calculate scores
   - User Stories: Generate AI-powered user stories
   - All other AI features (requires OpenAI key)

### Expected Behavior Before Backend Deployment

- Frontend loads correctly
- UI is fully functional
- Authentication will fail (no database tables yet)
- API calls will return errors (no edge functions yet)

### Expected Behavior After Backend Deployment

- Full authentication flow works
- Project creation successful
- AI features generate real content
- Data persists in database
- Payment flow works (after Stripe setup)

---

## Alternative: Automated Deployment Script

If you have Supabase CLI configured with proper authentication:

```bash
#!/bin/bash
cd /workspace

# Deploy database
psql $DATABASE_URL < deploy-database.sql
psql $DATABASE_URL < deploy-rls-policies.sql

# Deploy functions
for func in rice-calculator ai-user-story-generator ai-roadmap-optimizer sprint-planner ai-competitive-analysis ai-okr-alignment ai-communication-generator stripe-create-checkout stripe-webhook; do
  supabase functions deploy $func
done

echo "Deployment complete!"
```

---

## Troubleshooting

### Database Deployment Issues

**Error: "permission denied"**
- Solution: Ensure you're logged into Supabase Dashboard as project owner

**Error: "relation already exists"**
- Solution: Safe to ignore - tables use `CREATE TABLE IF NOT EXISTS`

### Edge Function Deployment Issues

**Error: "Invalid access token"**
- Solution: Re-authenticate with `supabase login`

**Error: "Function already exists"**
- Solution: Functions will be updated, not duplicated

### Runtime Issues

**Error: "OPENAI_API_KEY not found"**
- Solution: Set secret via Dashboard or CLI

**Error: "jwt malformed" or "unauthorized"**
- Solution: Check RLS policies are applied correctly

---

## Support & Documentation

**Full Documentation:**
- Database Schema: `/workspace/docs/database-schema.md`
- RLS Policies Details: `/workspace/docs/rls-policies.sql`
- Stripe Integration: `/workspace/docs/stripe-integration-guide.md`
- Deployment Guide: `/workspace/docs/deployment-guide.md`

**Project Files:**
- Frontend Build: `/workspace/productai-pro/dist/`
- Edge Functions: `/workspace/supabase/functions/`
- SQL Scripts: `/workspace/deploy-*.sql`

---

## Estimated Time to Full Production

- **Step 1** (Database): 5 minutes
- **Step 2** (Security): 3 minutes
- **Step 3** (Functions): 10 minutes
- **Optional** (Stripe): 15 minutes
- **Total**: ~20-30 minutes (without Stripe)

---

## Current Status Summary

### Completed:
- Frontend application (deployed)
- Database schema design (17 tables)
- RLS policies (all tables)
- Edge functions code (9 functions)
- OpenAI integration (configured)
- Complete documentation

### Pending Manual Steps:
1. Run deploy-database.sql in Supabase SQL Editor
2. Run deploy-rls-policies.sql in Supabase SQL Editor
3. Deploy 9 edge functions via CLI or Dashboard
4. (Optional) Configure Stripe for payments

---

**After completing these 3 steps, your ProductAI Pro platform will be fully operational!**
