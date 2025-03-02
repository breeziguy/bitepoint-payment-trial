
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_HASH = Deno.env.get('FLUTTERWAVE_SECRET_HASH')
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
    const payload = await req.json()
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2))
    
    // Verify webhook signature using the hash
    const signature = req.headers.get('verif-hash')
    if (!signature || signature !== FLUTTERWAVE_SECRET_HASH) {
      console.error('Invalid webhook signature')
      throw new Error('Invalid webhook signature')
    }

    // Process the webhook
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const txRef = payload.data.tx_ref
      const orderId = txRef.replace('order-', '')
      
      // Update order status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_confirmed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('payment_status', 'awaiting_transfer')

      if (orderUpdateError) {
        console.error('Error updating order status:', orderUpdateError)
        throw new Error('Failed to update order status')
      }

      console.log(`Order ${orderId} payment confirmed successfully`)
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
