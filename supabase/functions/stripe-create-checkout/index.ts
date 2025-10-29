// Stripe Checkout Session Creation Edge Function
// Creates a Stripe checkout session for subscription purchases

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 })
  }

  try {
    const { priceId, userId, email, tier } = await req.json()

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: priceId, userId, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    // Create Stripe checkout session
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'customer_email': email,
        'client_reference_id': userId,
        'metadata[user_id]': userId,
        'metadata[tier]': tier,
        'success_url': `${req.headers.get('origin') || 'http://localhost:5173'}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${req.headers.get('origin') || 'http://localhost:5173'}/subscription?canceled=true`,
      }).toString(),
    })

    if (!checkoutSession.ok) {
      const error = await checkoutSession.text()
      throw new Error(`Stripe API error: ${error}`)
    }

    const session = await checkoutSession.json()

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout session' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
