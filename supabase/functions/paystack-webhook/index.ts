import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Missing Paystack secret key')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const event = await req.json()
    const { event: eventType, data } = event

    // Verify webhook signature (implement this based on Paystack docs)
    // Handle different event types
    switch (eventType) {
      case 'charge.success':
        const { metadata, authorization, customer, reference } = data
        const { store_id, plan_id } = metadata

        // Update subscription with payment details
        const { error: updateError } = await supabase
          .from('store_subscriptions')
          .update({
            status: 'active',
            paystack_authorization_code: authorization.authorization_code,
            paystack_customer_code: customer.customer_code,
            last_payment_date: new Date().toISOString(),
            next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('store_id', store_id)
          .eq('plan_id', plan_id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          throw new Error('Failed to update subscription')
        }

        // Update store settings
        const { error: storeError } = await supabase
          .from('store_settings')
          .update({
            is_frozen: false
          })
          .eq('id', store_id)

        if (storeError) {
          console.error('Error updating store:', storeError)
          throw new Error('Failed to update store')
        }

        break

      case 'charge.failed':
        // Handle failed payment
        const failedMetadata = data.metadata
        const { error: freezeError } = await supabase
          .from('store_settings')
          .update({
            is_frozen: true
          })
          .eq('id', failedMetadata.store_id)

        if (freezeError) {
          console.error('Error freezing store:', freezeError)
          throw new Error('Failed to freeze store')
        }

        break
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})