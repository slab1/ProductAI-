// Stripe Webhook Handler Edge Function
// Handles Stripe webhook events for subscription lifecycle

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!stripeWebhookSecret || !stripeSecretKey) {
      throw new Error('Stripe credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const rawBody = await req.text()
    
    // Verify webhook signature
    const event = await verifyWebhookSignature(rawBody, signature, stripeWebhookSecret)
    
    console.log(`Processing webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.user_id || session.client_reference_id
        const tier = session.metadata?.tier || 'pro'
        
        if (userId && session.subscription) {
          // Update user's subscription in database
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: 'active',
              subscription_end_date: null, // Will be set by subscription updated event
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating profile:', error)
            throw error
          }

          console.log(`✅ Subscription activated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const userId = subscription.metadata?.user_id
        
        if (userId) {
          const endDate = new Date(subscription.current_period_end * 1000)
          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'canceled' ? 'canceled' : 'expired'

          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_end_date: endDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }

          console.log(`✅ Subscription updated for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata?.user_id
        
        if (userId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'expired',
              subscription_end_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) {
            console.error('Error canceling subscription:', error)
            throw error
          }

          console.log(`✅ Subscription canceled for user ${userId}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription
        
        // Get subscription to find user
        if (subscriptionId && stripeSecretKey) {
          const subResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
            headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
          })
          
          if (subResponse.ok) {
            const subscription = await subResponse.json()
            const userId = subscription.metadata?.user_id
            
            if (userId) {
              // Mark subscription as having payment issues
              const { error } = await supabase
                .from('profiles')
                .update({
                  subscription_status: 'expired',
                  updated_at: new Date().toISOString()
                })
                .eq('id', userId)

              if (error) console.error('Error updating failed payment:', error)
              else console.log(`⚠️ Payment failed for user ${userId}`)
            }
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Verify Stripe webhook signature
async function verifyWebhookSignature(payload: string, signature: string, secret: string) {
  const parts = signature.split(',')
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1]
  const signatures = parts.filter(p => p.startsWith('v1='))

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid signature format')
  }

  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  const isValid = signatures.some(sig => {
    const providedSignature = sig.split('=')[1]
    return providedSignature === expectedSignature
  })

  if (!isValid) {
    throw new Error('Invalid signature')
  }

  // Check timestamp to prevent replay attacks (5 minutes tolerance)
  const webhookTimestamp = parseInt(timestamp) * 1000
  const now = Date.now()
  if (Math.abs(now - webhookTimestamp) > 300000) {
    throw new Error('Timestamp too old')
  }

  return JSON.parse(payload)
}
