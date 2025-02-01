import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { plan_id, amount } = await req.json()
    console.log('Received request:', { plan_id, amount })

    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      console.error('Plan not found:', planError)
      throw new Error('Plan not found')
    }

    console.log('Found plan:', plan)

    // The amount is already in Naira, convert to kobo for Paystack
    const amountInKobo = Math.round(amount * 100)

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInKobo,
        email: 'mrolabola@gmail.com',
        callback_url: `${req.headers.get('origin')}/subscription/success`,
        metadata: {
          plan_id,
          custom_fields: [
            {
              display_name: "Plan Name",
              variable_name: "plan_name",
              value: plan.name
            }
          ]
        }
      }),
    })

    const paystackData = await response.json()
    console.log('Paystack response:', paystackData)

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Failed to initialize payment')
    }

    return new Response(JSON.stringify(paystackData.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in paystack function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})