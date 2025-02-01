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
    // Get the reference from either the webhook payload or URL parameters
    const url = new URL(req.url)
    const urlReference = url.searchParams.get('reference')
    
    let reference: string | undefined
    
    if (req.method === 'GET' && urlReference) {
      // Handle direct callback from payment page
      console.log('Processing callback with reference:', urlReference)
      reference = urlReference
    } else if (req.method === 'POST') {
      // Handle webhook event
      const payload = await req.json()
      console.log('Received webhook payload:', JSON.stringify(payload, null, 2))
      reference = payload.data?.reference
    }

    if (!reference) {
      console.error('No transaction reference found')
      throw new Error('No transaction reference found')
    }

    console.log('Processing transaction reference:', reference)

    // Verify the transaction with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const verificationData = await verifyResponse.json()
    console.log('Verification response:', JSON.stringify(verificationData, null, 2))

    if (!verificationData.status || verificationData.data?.status !== 'success') {
      console.error('Transaction verification failed:', verificationData)
      throw new Error('Transaction verification failed')
    }

    // Get the plan ID from metadata
    const metadata = verificationData.data?.metadata
    if (!metadata?.plan_id) {
      console.error('No plan ID found in transaction metadata')
      throw new Error('No plan ID found in transaction metadata')
    }

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', metadata.plan_id)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', planError)
      throw new Error('Plan not found')
    }

    console.log('Found plan:', plan)

    // Create or update subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('store_subscriptions')
      .upsert({
        plan_id: metadata.plan_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        paystack_email: verificationData.data?.customer?.email || 'mrolabola@gmail.com',
        paystack_subscription_code: reference,
        store_id: crypto.randomUUID(), // This should be the actual store ID
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError)
      throw subscriptionError
    }

    console.log('Subscription updated successfully:', subscription)

    // For GET requests (direct callbacks), redirect back to the billing page
    if (req.method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `${url.origin}/admin/settings?tab=billing&status=success`,
        },
      })
    }

    // For POST requests (webhooks), return success response
    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})