import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

export function SubscriptionBanner() {
  const { data: subscription } = useQuery({
    queryKey: ["store-subscription"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("paystack_email", "mrolabola@gmail.com")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (!subscription) return null;

  const daysUntilExpiry = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 7) return null;

  const handleRenew = async () => {
    try {
      const response = await supabase.functions.invoke('paystack', {
        body: {
          plan_id: subscription.plan_id,
          amount: subscription.subscription_plans.price,
        },
      });

      if (response.error) {
        console.error('Payment initialization error:', response.error);
        return;
      }

      if (!response.data || !response.data.authorization_url) {
        console.error('Invalid response data:', response.data);
        return;
      }

      // Store the plan ID in session storage to verify after payment
      sessionStorage.setItem('pending_subscription_plan', subscription.plan_id);
      
      window.location.href = response.data.authorization_url;
    } catch (error) {
      console.error('Error initiating renewal:', error);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background">
      <Alert className="rounded-none border-0 bg-yellow-50">
        <Timer className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Subscription Expiring Soon</AlertTitle>
        <div className="flex items-center justify-between">
          <AlertDescription className="text-yellow-700">
            Your subscription will expire in {daysUntilExpiry} days. Please renew to avoid service interruption.
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={handleRenew}
            className="ml-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800"
          >
            Renew Now
          </Button>
        </div>
      </Alert>
    </div>
  );
}