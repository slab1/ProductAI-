# Stripe Payment Integration - ProductAI Pro

## Overview
Complete Stripe subscription payment system with webhook handling for ProductAI Pro's 3-tier pricing model.

## Stripe Configuration Required

### 1. Create Stripe Products & Prices
In your Stripe Dashboard (https://dashboard.stripe.com):

**Pro Plan ($299/month)**:
- Product Name: "ProductAI Pro - Pro Plan"
- Price: $299 USD recurring monthly
- Copy the Price ID (starts with `price_...`)

**Enterprise Plan ($999/month)**:
- Product Name: "ProductAI Pro - Enterprise"
- Price: $999 USD recurring monthly
- Copy the Price ID (starts with `price_...`)

### 2. Environment Variables
Add these to your Supabase Edge Functions secrets:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Created in step 3

# Add to frontend .env file
VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
```

### 3. Configure Stripe Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_...`)
6. Add it as `STRIPE_WEBHOOK_SECRET` to Supabase secrets

## Edge Functions

### stripe-create-checkout
**Purpose**: Creates Stripe Checkout session for subscription purchases

**Location**: `/workspace/supabase/functions/stripe-create-checkout/index.ts`

**Request Body**:
```json
{
  "priceId": "price_xxxxx",
  "userId": "user-uuid",
  "email": "user@example.com",
  "tier": "pro" | "enterprise"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/..."
}
```

### stripe-webhook
**Purpose**: Handles Stripe webhook events and updates user subscription status in database

**Location**: `/workspace/supabase/functions/stripe-webhook/index.ts`

**Handles Events**:
- `checkout.session.completed` → Activates subscription
- `customer.subscription.updated` → Updates subscription status and end date
- `customer.subscription.deleted` → Downgrades to free tier
- `invoice.payment_failed` → Marks subscription as expired

**Security Features**:
- Webhook signature verification
- Timestamp validation (5-minute tolerance)
- Replay attack prevention

## Frontend Integration

### SubscriptionPage Component
**Location**: `/workspace/productai-pro/src/pages/SubscriptionPage.tsx`

**Features**:
- Displays 3-tier pricing (Free, Pro $299, Enterprise $999)
- Calls `stripe-create-checkout` edge function
- Redirects to Stripe Checkout
- Handles success/cancel redirects
- Shows current subscription status

**User Flow**:
1. User clicks "Upgrade to Pro" button
2. Frontend calls `stripe-create-checkout` edge function
3. Edge function creates Stripe Checkout session
4. User redirected to Stripe payment page
5. After payment, redirected back with success parameter
6. Webhook updates database in background
7. User's profile shows new subscription status

## Database Updates

The webhook handler updates the `profiles` table:

```sql
-- On successful checkout
UPDATE profiles SET
  subscription_tier = 'pro',
  subscription_status = 'active',
  subscription_end_date = NULL
WHERE id = user_id;

-- On subscription update
UPDATE profiles SET
  subscription_status = 'active',
  subscription_end_date = '2025-11-29T00:00:00Z'
WHERE id = user_id;

-- On subscription cancellation
UPDATE profiles SET
  subscription_tier = 'free',
  subscription_status = 'expired',
  subscription_end_date = NOW()
WHERE id = user_id;
```

## Testing

### Test Mode Setup
1. Use Stripe test API keys (start with `sk_test_`)
2. Use test price IDs from Stripe Dashboard test mode
3. Use test webhook secret

### Test Cards
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`

Use any future expiry date and any CVC.

### Testing Webhook Locally
```bash
# Install Stripe CLI
stripe listen --forward-to https://tdvhmmrvxlwaocfcvdls.supabase.co/functions/v1/stripe-webhook

# Trigger test event
stripe trigger checkout.session.completed
```

## Deployment Checklist

- [ ] Create Stripe products and prices
- [ ] Copy Stripe API keys
- [ ] Set Supabase secrets (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Deploy stripe-create-checkout edge function
- [ ] Deploy stripe-webhook edge function
- [ ] Configure Stripe webhook endpoint
- [ ] Test webhook events
- [ ] Add price IDs to frontend environment variables
- [ ] Deploy frontend application
- [ ] Test complete checkout flow
- [ ] Verify database updates after webhook

## Production Considerations

1. **Switch to Live Mode**: Replace test keys with live keys
2. **Error Monitoring**: Set up logging for webhook failures
3. **Rate Limiting**: Add rate limits to checkout endpoint
4. **Customer Portal**: Consider adding Stripe Customer Portal for self-service subscription management
5. **Invoicing**: Configure Stripe to send invoices automatically
6. **Failed Payments**: Set up email notifications for failed payments

## Troubleshooting

### Webhook not receiving events
- Check webhook endpoint URL is correct
- Verify signing secret matches
- Check Supabase edge function logs
- Ensure webhook is not disabled in Stripe dashboard

### Checkout session creation fails
- Verify STRIPE_SECRET_KEY is set correctly
- Check price IDs match Stripe dashboard
- Review edge function logs for errors

### Database not updating
- Check SUPABASE_SERVICE_ROLE_KEY is set in edge function
- Verify user_id is passed correctly in metadata
- Check RLS policies allow updates

## Cost Estimation

**Stripe Fees (US)**:
- 2.9% + $0.30 per successful charge
- Pro Plan: $8.97 per transaction
- Enterprise Plan: $29.27 per transaction

**Supabase Edge Function Costs**:
- Free tier: 500K requests/month
- Typical usage: ~10 requests per subscription event
