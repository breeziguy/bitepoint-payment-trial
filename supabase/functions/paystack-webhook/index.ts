import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const urlReference = url.searchParams.get('reference')
    
    let reference: string | undefined
    
    if (req.method === 'GET' && urlReference) {
      console.log('Processing callback with reference:', urlReference)
      reference = urlReference
    } else if (req.method === 'POST') {
      const payload = await req.json()
      console.log('Received webhook payload:', JSON.stringify(payload, null, 2))
      reference = payload.data?.reference
    }

    if (!reference) {
      console.error('No transaction reference found')
      throw new Error('No transaction reference found')
    }

    console.log('Processing transaction reference:', reference)

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

    const metadata = verificationData.data?.metadata
    if (!metadata?.plan_id) {
      console.error('No plan ID found in transaction metadata')
      throw new Error('No plan ID found in transaction metadata')
    }

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

    // First, mark any existing active subscriptions as expired
    const { error: updateError } = await supabase
      .from('store_subscriptions')
      .update({ status: 'expired' })
      .eq('paystack_email', verificationData.data?.customer?.email || 'mrolabola@gmail.com')
      .eq('status', 'active')

    if (updateError) {
      console.error('Error updating existing subscriptions:', updateError)
      throw updateError
    }

    // Then create the new active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('store_subscriptions')
      .insert({
        plan_id: metadata.plan_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paystack_email: verificationData.data?.customer?.email || 'mrolabola@gmail.com',
        paystack_subscription_code: reference,
        store_id: crypto.randomUUID(),
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      throw subscriptionError
    }

    console.log('Subscription created successfully:', subscription)

    // For GET requests (direct callbacks), redirect back to the admin page
    if (req.method === 'GET') {
      const redirectUrl = new URL('/admin', url.origin)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectUrl.toString(),
        },
      })
    }

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