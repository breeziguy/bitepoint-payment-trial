import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Get the pending plan ID from session storage
        const pendingPlanId = sessionStorage.getItem('pending_subscription_plan');
        
        if (!pendingPlanId) {
          console.error('No pending subscription plan found');
          navigate('/subscription/error', {
            state: { error: 'Invalid subscription attempt' },
            replace: true
          });
          return;
        }

        // Get plan details
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', pendingPlanId)
          .single();

        if (planError || !plan) {
          throw new Error('Plan not found');
        }

        // Update existing subscriptions to expired
        const { error: updateError } = await supabase
          .from("store_subscriptions")
          .update({ status: 'expired' })
          .eq("paystack_email", "mrolabola@gmail.com")
          .eq("status", "active");

        if (updateError) {
          throw updateError;
        }

        // Create new active subscription
        const { error: subscriptionError } = await supabase
          .from("store_subscriptions")
          .insert({
            plan_id: pendingPlanId,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            paystack_email: "mrolabola@gmail.com",
            store_id: crypto.randomUUID(),
          });

        if (subscriptionError) {
          throw subscriptionError;
        }

        // Show success message
        toast({
          title: "Subscription Activated",
          description: "Your subscription has been activated successfully.",
        });

        // Clean up
        sessionStorage.removeItem('pending_subscription_plan');
        
        // Redirect to admin dashboard
        navigate("/admin", { replace: true });
      } catch (error) {
        console.error('Subscription verification error:', error);
        navigate('/subscription/error', {
          state: { error: error.message || 'Failed to verify subscription' },
          replace: true
        });
      }
    };

    verifySubscription();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Subscription...</h1>
        <p>Please wait while we verify your payment...</p>
      </div>
    </div>
  );
}