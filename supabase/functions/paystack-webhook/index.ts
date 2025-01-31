import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const hash = req.headers.get('x-paystack-signature')

    // Verify webhook signature
    const expectedHash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(body))
      .digest('hex')

    if (hash !== expectedHash) {
      throw new Error('Invalid signature')
    }

    const { event, data } = body

    // Handle successful payment
    if (event === 'charge.success') {
      const { metadata, customer } = data
      const { plan_id } = metadata

      // Create or update subscription
      const { error: subscriptionError } = await supabase
        .from('store_subscriptions')
        .upsert({
          plan_id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paystack_email: customer.email,
          store_id: crypto.randomUUID(), // This should be the actual store ID
        })

      if (subscriptionError) {
        throw subscriptionError
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})