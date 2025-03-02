
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, customer_name, customer_phone, order_id } = await req.json()
    console.log('Received request:', { amount, customer_name, customer_phone, order_id })

    if (!amount || !customer_name || !customer_phone || !order_id) {
      throw new Error('Missing required parameters')
    }

    // Initialize bank transfer with Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/virtual-account-numbers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com', // Can use a generic email or generate one
        is_permanent: false,
        tx_ref: `order-${order_id}`,
        amount: amount,
        narration: `Payment for order ${order_id}`,
        bvn: "22222222222",
        phonenumber: customer_phone.replace(/\D/g, ''),
        firstname: customer_name.split(' ')[0] || customer_name,
        lastname: customer_name.split(' ')[1] || "",
      }),
    })

    const flutterwaveData = await response.json()
    console.log('Flutterwave response:', flutterwaveData)

    if (!flutterwaveData.status || flutterwaveData.status !== 'success') {
      throw new Error(flutterwaveData.message || 'Failed to generate account number')
    }

    // Update order with payment information
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        payment_reference: flutterwaveData.data.flw_ref,
        payment_status: 'awaiting_transfer'
      })
      .eq('id', order_id)

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError)
      throw new Error('Failed to update order with payment information')
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        account_number: flutterwaveData.data.account_number,
        account_name: flutterwaveData.data.bank_name,
        bank_name: flutterwaveData.data.bank_name,
        amount: amount,
        order_id: order_id,
        reference: flutterwaveData.data.flw_ref
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in flutterwave function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
