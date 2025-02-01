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

        // Check if a subscription already exists
        const { data: existingSubscription, error: checkError } = await supabase
          .from("store_subscriptions")
          .select("*")
          .eq("paystack_email", "mrolabola@gmail.com")
          .eq("status", "active")
          .maybeSingle();

        if (checkError) {
          throw checkError;
        }

        if (existingSubscription) {
          console.log('Subscription already exists:', existingSubscription);
          sessionStorage.removeItem('pending_subscription_plan');
          navigate("/admin/settings?tab=billing", { replace: true });
          return;
        }

        // Show success message
        toast({
          title: "Subscription Successful",
          description: "Your subscription has been processed successfully.",
        });

        // Clean up
        sessionStorage.removeItem('pending_subscription_plan');
        
        // Redirect to billing tab
        navigate("/admin/settings?tab=billing", { replace: true });
      } catch (error) {
        console.error('Subscription verification error:', error);
        navigate('/subscription/error', {
          state: { error: 'Failed to verify subscription' },
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