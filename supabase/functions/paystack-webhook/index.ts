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
    console.log('Received webhook payload:', body)
    
    const hash = req.headers.get('x-paystack-signature')
    
    // Skip signature verification for test transactions
    if (!body.data.test && hash) {
      const expectedHash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY!)
        .update(JSON.stringify(body))
        .digest('hex')

      if (hash !== expectedHash) {
        console.error('Invalid signature')
        throw new Error('Invalid signature')
      }
    }

    const { event, data } = body

    // Handle successful payment
    if (event === 'charge.success' || event === 'transfer.success') {
      console.log('Processing successful payment:', data)
      
      const { metadata, customer, reference } = data

      // For test transactions, we'll skip verification
      let verificationStatus = { status: false }
      
      if (!data.test) {
        // Verify the transaction for non-test payments
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        })
        verificationStatus = await verifyResponse.json()
        console.log('Verification response:', verificationStatus)
      } else {
        // Auto-approve test transactions
        verificationStatus = { status: true }
        console.log('Test transaction - auto-approving')
      }
      
      if (!verificationStatus.status) {
        console.error('Transaction verification failed:', verificationStatus)
        throw new Error('Transaction verification failed')
      }

      console.log('Transaction verified successfully')

      // Get the plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', metadata.plan_id)
        .single()

      if (planError) {
        console.error('Error fetching plan:', planError)
        throw planError
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
          paystack_email: customer.email,
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