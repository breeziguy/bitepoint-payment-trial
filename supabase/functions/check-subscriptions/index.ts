import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get subscriptions expiring in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringSubscriptions, error: subscriptionError } = await supabase
      .from('store_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          price
        )
      `)
      .eq('status', 'active')
      .lt('current_period_end', sevenDaysFromNow.toISOString())
      .gt('current_period_end', new Date().toISOString());

    if (subscriptionError) {
      throw subscriptionError;
    }

    console.log('Found expiring subscriptions:', expiringSubscriptions);

    // Send reminder emails for each expiring subscription
    for (const subscription of expiringSubscriptions) {
      const daysUntilExpiry = Math.ceil(
        (new Date(subscription.current_period_end).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      await resend.emails.send({
        from: "Lovable <onboarding@resend.dev>",
        to: [subscription.paystack_email],
        subject: "Your subscription is expiring soon",
        html: `
          <h1>Your subscription is expiring soon</h1>
          <p>Your ${subscription.subscription_plans.name} plan will expire in ${daysUntilExpiry} days.</p>
          <p>To continue using our services without interruption, please renew your subscription.</p>
          <p>Subscription Details:</p>
          <ul>
            <li>Plan: ${subscription.subscription_plans.name}</li>
            <li>Amount: ₦${subscription.subscription_plans.price / 100}</li>
            <li>Expires: ${new Date(subscription.current_period_end).toLocaleDateString()}</li>
          </ul>
          <p>For bank transfer payments, please contact our support team.</p>
        `,
      });

      console.log('Sent reminder email to:', subscription.paystack_email);
    }

    // Check for expired subscriptions and update their status
    const { error: updateError } = await supabase
      .from('store_subscriptions')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'active')
      .lt('current_period_end', new Date().toISOString());

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Subscription check completed',
        checked: expiringSubscriptions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in check-subscriptions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});